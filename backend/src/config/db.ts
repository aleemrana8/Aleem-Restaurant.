import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[DB] MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }
}
