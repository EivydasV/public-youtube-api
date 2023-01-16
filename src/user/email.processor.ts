import {
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { SendgridService } from '../sendgrid/sendgrid.service';
import path from 'node:path';
import { formatDistance, parseISO } from 'date-fns';

export type EmailJob = {
  protocol: string;
  host: string;
  to: string;
  token: string;
  userId: string;
  date: Date;
};

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly sendGridService: SendgridService) {}
  @Process()
  async sendEmail({ data }: Job<EmailJob>) {
    await this.sendGridService.send({
      text: 'Reset password',
      to: data.to,
      html: `<p>Reset your password token: <h3>${data.protocol}://${path.join(
        data.host,
        '/v1/api/user/reset-password/',
        data.token,
        data.userId,
      )}</h3>
        <h4>Valid for <bold>${formatDistance(
          parseISO(data.date.toString()),
          new Date(),
        )}</bold></h4>
        `,
      subject: 'Reset your password',
    });
  }

  @OnQueueError()
  onError(error) {
    this.logger.error(error);
  }
  @OnQueueCompleted()
  async onCompleted(job: Job<EmailJob>) {
    this.logger.debug(`email sent to ${job.data.to}`);
  }
}
