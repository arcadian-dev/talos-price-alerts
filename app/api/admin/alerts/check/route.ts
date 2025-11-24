import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AlertService } from '@/lib/alerts/AlertService';

// POST /api/admin/alerts/check - Manually trigger alert checking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alertService = new AlertService();
    const report = await alertService.checkAllAlerts();

    return NextResponse.json({
      success: true,
      message: `Alert check completed. ${report.alertsSent} alerts sent out of ${report.totalChecks} subscriptions.`,
      report,
    });

  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/alerts/check - Get alert checking status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return basic info about alert system
    return NextResponse.json({
      alertSystem: {
        enabled: true,
        emailServiceConfigured: !!(process.env.SENDGRID_API_KEY || process.env.SMTP_HOST),
        lastManualCheck: null, // Would track this in a real implementation
      },
    });

  } catch (error) {
    console.error('Error getting alert status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
