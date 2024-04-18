// Docs:
// https://github.com/aws-samples/aws-cdk-examples/blob/main/typescript/ecs/cluster/index.ts
// https://docs.aws.amazon.com/cdk/v2/guide/ecs_example.html

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class NestjsEcsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB
    const dynamoTable = new Table(this, 'items', {
      partitionKey: {
        name: 'taskId',
        type: AttributeType.STRING,
      },
      tableName: 'tasks',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
    });

    // Cluster
    const cluster = new ecs.Cluster(this, 'MyCluster', { vpc });

    // Fargate Service
    const fargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        'MyFargateService',
        {
          cluster,
          cpu: 256,
          memoryLimitMiB: 512,
          taskImageOptions: {
            image: ecs.ContainerImage.fromRegistry('gonove/nestjs'),
          },
          desiredCount: 2,
        }
      );

    // Allow Fargate service to access DynamoDB
    dynamoTable.grantReadWriteData(fargateService.taskDefinition.taskRole);

    // Outputs
    new cdk.CfnOutput(this, 'DynamoTable', {
      value: dynamoTable.tableName,
    });

    new cdk.CfnOutput(this, 'ServiceURL', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
    });
  }
}
