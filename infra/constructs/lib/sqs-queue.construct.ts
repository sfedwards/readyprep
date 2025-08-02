import { Construct } from "constructs";
import { CloudwatchMetricAlarm, SqsQueue } from "@cdktf/provider-aws";

export interface SqsWithDlqAndAlarmsConfig {
  name: string;
}

export class SqsWithDlqAndAlarms extends Construct {
  public readonly queue: SqsQueue;
  public readonly dlq: SqsQueue;
  public readonly dlqAlarm: CloudwatchMetricAlarm;
  public readonly longQueueAlarm: CloudwatchMetricAlarm;

  constructor(scope: Construct, id: string, config: SqsWithDlqAndAlarmsConfig) {
    super(scope, id);

    const { name } = config;

    const dlq = this.dlq = new SqsQueue(this, "main_queue", {
      name: `${name}-DLQ`,
      messageRetentionSeconds: 14 * 24 * 60 * 60,
    });

    const queue = this.queue = new SqsQueue(this, "dead_letter_queue", {
      name,
      receiveWaitTimeSeconds: 20,
      visibilityTimeoutSeconds: 10,
      redrivePolicy: JSON.stringify({
        deadLetterTargetArn: dlq.arn,
        maxReceiveCount: 4,
      }),
    });

    this.dlqAlarm = new CloudwatchMetricAlarm(this, "dlq_nonEmpty", {
      alarmName: `DLQ Not Empty - ${name}`,
      metricName: "ApproximateNumberOfMessagesVisible",
      statistic: "Maximum",
      comparisonOperator: "GreaterThanOrEqualToThreshold",
      threshold: 1,
      evaluationPeriods: 1,
      dimensions: {
        QueueName: dlq.name,
      },
      actionsEnabled: true,
    });

    this.longQueueAlarm = new CloudwatchMetricAlarm(this, "queue_backedUp", {
      alarmName: "Long Queue - sendEmail",
      metricName: "ApproximateNumberOfMessagesVisible",
      statistic: "Average",
      comparisonOperator: "GreaterThanOrEqualToThreshold",
      threshold: 500,
      evaluationPeriods: 1,
      period: 600,
      dimensions: {
        QueueName: queue.name,
      },
      actionsEnabled: true,
    });
  }
}
