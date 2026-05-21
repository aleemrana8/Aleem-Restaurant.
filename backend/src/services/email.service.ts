import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export async function sendOtpEmail(to: string, otp: string, purpose: string): Promise<void> {
  const purposeText = purpose === 'login' ? 'Login Verification' : purpose === 'register' ? 'Account Verification' : 'Password Reset';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">🍗 Aleem Restaurant</h1>
        <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">${purposeText}</p>
      </div>
      <div style="padding: 40px 32px; text-align: center;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Your verification code is:</p>
        <div style="background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2026 Aleem Restaurant. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Aleem Restaurant" <${env.smtp.user}>`,
    to,
    subject: `${otp} - Your Aleem Restaurant ${purposeText} Code`,
    html,
  });
}
