import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug/env - Debug environment variables (remove in production)
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      // Don't expose actual values for security
      adminPasswordLength: process.env.ADMIN_PASSWORD?.length || 0,
    });
  } catch (error) {
    console.error('Debug env error:', error);
    return NextResponse.json({ error: 'Debug error' }, { status: 500 });
  }
}
