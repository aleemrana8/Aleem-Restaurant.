import crypto from 'crypto';
import { Otp } from '../models/Otp';
import { sendOtpEmail } from './email.service';

export class OtpService {
  static generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async sendOtp(email: string, purpose: 'login' | 'register' | 'reset_password'): Promise<void> {
    // Invalidate any existing OTPs for this email + purpose
    await Otp.deleteMany({ email, purpose });

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ email, otp, purpose, expiresAt });
    await sendOtpEmail(email, otp, purpose);
  }

  static async verifyOtp(email: string, otp: string, purpose: 'login' | 'register' | 'reset_password'): Promise<boolean> {
    const record = await Otp.findOne({ email, purpose, verified: false })
      .sort({ createdAt: -1 });

    if (!record) {
      throw new Error('No OTP found. Please request a new one.');
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      throw new Error('OTP expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      await record.deleteOne();
      throw new Error('Too many attempts. Please request a new OTP.');
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      throw new Error(`Invalid OTP. ${5 - record.attempts} attempts remaining.`);
    }

    record.verified = true;
    await record.save();

    // Cleanup
    await Otp.deleteMany({ email, purpose, _id: { $ne: record._id } });

    return true;
  }
}
