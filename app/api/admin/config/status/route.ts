import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/config/status - Get configuration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configStatus = {
      grokApi: {
        configured: !!process.env.GROK_API_KEY,
        keyLength: process.env.GROK_API_KEY?.length || 0,
        model: process.env.GROK_MODEL || 'grok-2-1212',
      },
      mongodb: {
        configured: !!process.env.MONGODB_URI,
      },
      nextAuth: {
        configured: !!process.env.NEXTAUTH_SECRET,
      },
      adminPassword: {
        configured: !!process.env.ADMIN_PASSWORD,
      },
    };

    return NextResponse.json(configStatus);
  } catch (error) {
    console.error('Error checking config status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
