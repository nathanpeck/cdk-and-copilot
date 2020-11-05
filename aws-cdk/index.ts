import { ContainerImage } from '@aws-cdk/aws-ecs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { App, Stack } from '@aws-cdk/core';
import { DynamoDbTable } from './infrastructure/dynamodb-table';

import {
  Container,
  Environment,
  HttpLoadBalancerExtension,
  ScaleOnCpuUtilization,
  Service,
  ServiceDescription
} from '@aws-cdk-containers/ecs-service-extensions';

const app = new App();
const stack = new Stack(app, 'hit-counter-demo');

const environment = new Environment(stack, 'production');

/** Define the hit counter service */
const hitCounterDescription = new ServiceDescription();
hitCounterDescription.add(new Container({
  cpu: 1024,
  memoryMiB: 2048,
  trafficPort: 80,
  image: ContainerImage.fromAsset('app')
}));
hitCounterDescription.add(new ScaleOnCpuUtilization({
  initialTaskCount: 2,
  minTaskCount: 2,
}));
hitCounterDescription.add(new HttpLoadBalancerExtension());
hitCounterDescription.add(new DynamoDbTable('hits', {
  partitionKey: {
    name: 'counter',
    type: dynamodb.AttributeType.STRING
  }
}));

// Add the hit counter service to the production environment.
new Service(stack, 'hit-counter', {
  environment: environment,
  serviceDescription: hitCounterDescription,
});
