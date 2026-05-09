import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'SENA Software';
    const fromEmail = this.configService.get<string>('MAIL_USER');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Código de recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #39a900;">Recuperación de contraseña</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Tu código de verificación es:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p>Este código expira en <strong>15 minutos</strong>.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    });
  }
}
