import { Stack, StackProps, aws_iam, CfnParameter, App } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, OriginAccessIdentity, CloudFrontAllowedMethods, CloudFrontAllowedCachedMethods, OriginProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { Vpc, FlowLog, FlowLogResourceType, FlowLogDestination, Port } from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';

import * as path from 'path';
import { NagSuppressions } from 'cdk-nag';

export class UiComposerStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
      // --------  S3 Bucket ------------  
      const sourceBucket = new Bucket(this, 'mfe-static-assets', {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true
      });

      // --------  UI-COMPOSER-MICROSERVICE ------------  
      const vpc = new Vpc(this, "ui-composer-vpc", {
        maxAzs: 3
      });

      const cluster = new Cluster(this, "ui-composer-cluster", {
        vpc: vpc,
        containerInsights: true,
      });

      const vpcLogGroup = new LogGroup(this, 'VPCLogGroup');
      const role = new Role(this, "vpc-log-group", {
        assumedBy: new ServicePrincipal('vpc-flow-logs.amazonaws.com')
      });

      const flowlog = new FlowLog(this, 'FlowLog', {
        resourceType: FlowLogResourceType.fromVpc(vpc),
        destination: FlowLogDestination.toCloudWatchLogs(vpcLogGroup, role)
      });


      // -------- PARAMETER STORE -------

      const catalogARN = StringParameter.valueForStringParameter(this, this.node.tryGetContext('catalogArn'));
      const reviewsARN = StringParameter.valueForStringParameter(this, this.node.tryGetContext('reviewsArn'));
      
      // ----------------------------------------

      const taskRole = new aws_iam.Role(this, "fargate-task-role", {
        assumedBy: new aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        roleName: "fargate-task-role",
        description: "IAM role for consuming MFEs"  
      });

      taskRole.attachInlinePolicy(
        new aws_iam.Policy(this, "task-policy", {
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["ssm:GetParameter"],
              resources: ["*"]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [reviewsARN]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["states:StartSyncExecution"],
              resources: [catalogARN]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["s3:GetObject"],
              resources: [`${sourceBucket.bucketArn}/*`]
            }),
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: ["s3:ListBucket"],
              resources: [sourceBucket.bucketArn]
            })
          ],
        })
      );

      const loadBalancedFargateService = new ApplicationLoadBalancedFargateService(this, 'ui-composer-service', {
        cluster,
        memoryLimitMiB: 2048,
        desiredCount: 3,
        cpu: 1024,
        openListener: false,
        listenerPort: 80,
        publicLoadBalancer: true,
        taskImageOptions:{
          image: ContainerImage.fromAsset(path.resolve(__dirname, '../')),
          taskRole: taskRole,
          executionRole: taskRole,
          environment: {
            REGION: process.env.region || "eu-west-1"
          }
        },
      });
    
      loadBalancedFargateService.targetGroup.configureHealthCheck({
        path: "/health",
      });
      
      const scalableTarget = loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 3,
        maxCapacity: 4,
      });
      
      scalableTarget.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 70,
      });
      
      scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: 70,
      });

      // ----------------------------------------

      // --------  CF distro ------------    

      const oai = new OriginAccessIdentity(this, 'mfe-oai')

      const distribution = new CloudFrontWebDistribution(this, 'mfe-distro', {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: sourceBucket,
              originAccessIdentity: oai
            },
            behaviors : [
              { pathPattern: '/static/*',
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD
              }
            ],
          },
          {
            customOriginSource: {
              domainName: loadBalancedFargateService.loadBalancer.loadBalancerDnsName,
              originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors : [
              {
                isDefaultBehavior: true,
                allowedMethods: CloudFrontAllowedMethods.ALL,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: 'all'
                  },
                  headers: ['*'],
                }
              }
          ]
          }
        ],
      });
      
      // ----------------------------------------

      // --------  NAG suppression statements ------------ 
      NagSuppressions.addResourceSuppressions(loadBalancedFargateService.loadBalancer, [
        {id: 'AwsSolutions-ELB2', reason: 'It\'s a demo so no need to enable access logs'}
      ])

      NagSuppressions.addResourceSuppressions(loadBalancedFargateService.taskDefinition, [
        {id: 'AwsSolutions-ECS2', reason: 'It\'s a demo'}
      ])
      
      NagSuppressions.addStackSuppressions(this, [
        {id: 'AwsSolutions-IAM5', reason: 'remediate with override inline policies'}
      ])

      NagSuppressions.addResourceSuppressions(distribution, [
        { id: 'AwsSolutions-CFR5', reason: 'It\'s a demo so no need to enforce SSLv3 or TLSv1' },
        { id: 'AwsSolutions-CFR4', reason: 'It\'s a demo so no need to enforce SSLv3 or TLSv1' },
        { id: 'AwsSolutions-CFR3', reason: 'It\'s a demo so no need to have access logs' },
        { id: 'AwsSolutions-CFR2', reason: 'It\'s a demo so no need to integrate WAF on the CloudFront Distribution' },
        { id: 'AwsSolutions-CFR1', reason: 'It\'s a demo so no need to implement GEO restriction rules' },
      ]);
      
      NagSuppressions.addResourceSuppressions(sourceBucket, [
        { id: 'AwsSolutions-S3', reason: 'The bucket contains only HTML, JS or CSS files' },
        { id: 'AwsSolutions-S1', reason: 'It\'s a demo so no need to enable access logs' },
      ]);

  }
}