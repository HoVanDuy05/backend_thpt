import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResendMailService } from './resend-mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get('MAIL_HOST') || 'smtp.gmail.com',
                    port: parseInt(config.get('MAIL_PORT') || '587'),
                    secure: config.get('MAIL_SECURE') === 'true', // true for 465, false for other ports
                    auth: {
                        user: config.get('MAIL_USER'),
                        pass: config.get('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${config.get('MAIL_FROM') || config.get('MAIL_USER')}>`,
                },
                template: {
                    dir: path.join(__dirname, 'templates'),
                    adapter: new EjsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService, ResendMailService],
    exports: [MailService, ResendMailService],
})
export class MailModule { }
