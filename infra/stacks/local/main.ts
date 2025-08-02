import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider, SnsTopic, SnsTopicSubscription } from "@cdktf/provider-aws";
import { SqsWithDlqAndAlarms } from "../../constructs/lib/sqs-queue.construct";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "localstack", {
      region: "us-east-1",

      accessKey: "mock_access_key",
      secretKey: "mock_secret_key",

      skipCredentialsValidation: true,
      skipRequestingAccountId: true,
      skipMetadataApiCheck: true,
      s3ForcePathStyle: true,

      endpoints: [
        {
          cloudwatch: "http://localhost:14566",
          sqs: "http://localhost:14566",
          sns: "http://localhost:14566",
        },
      ],
    });

    const snsTopicAlarms = new SnsTopic(this, "alarms", {
      name: "Alarms",
    });
    
    const snsTopicEvents = new SnsTopic(this, "events", {
      name: "Events",
    });

    const countingListUpdatedEventQueue = new SqsWithDlqAndAlarms(this, "event_ingredientAddedToCountingList", {
      name: "events",
    });
    
    new SnsTopicSubscription(
      this,
      'eventSubscription_countingListUpdatedEventQueue',
      {
        topicArn: snsTopicEvents.arn,
        protocol: 'sqs',
        endpoint: countingListUpdatedEventQueue.queue.arn,
        filterPolicy: `{"event": "counting_list_updated"}`,
      }
    );

    const dailyReportJobQueue = new SqsWithDlqAndAlarms(this, "sendDailyReport", {
      name: "job_sendDailyReportEmail",
    });

    dailyReportJobQueue.dlqAlarm.alarmActions = [snsTopicAlarms.arn];
    dailyReportJobQueue.longQueueAlarm.alarmActions = [snsTopicAlarms.arn];
  }
}

const app = new App();
new MyStack(app, "local");
app.synth();
