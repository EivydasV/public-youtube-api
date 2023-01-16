import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import sendgridConfig from './sendgrid.config';
import SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(
    @Inject(sendgridConfig.KEY)
    private readonly config: ConfigType<typeof sendgridConfig>,
  ) {
    SendGrid.setApiKey(this.config.SENDGRID_API_KEY);
  }
  async send(
    mail: Pick<SendGrid.MailDataRequired, 'to' | 'subject' | 'text' | 'html'>,
  ) {
    const transport = await SendGrid.send({
      ...mail,
      from: this.config.SENDGRID_SENDER_EMAIL,
    } as SendGrid.MailDataRequired);

    return transport;
  }
}
