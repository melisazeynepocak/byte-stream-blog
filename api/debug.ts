import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Environment variable'ları kontrol et
  const envCheck = {
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    VERCEL: process.env.VERCEL || 'Not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'Not set'
  };

  res.status(200).json({
    message: 'Debug info',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}
