import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '@/lib/alerts/AlertService';

// POST /api/cron/check-alerts - Scheduled alert checking (called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting scheduled alert check...');
    
    const alertService = new AlertService();
    const report = await alertService.checkAllAlerts();

    console.log(`Alert check completed: ${report.alertsSent} alerts sent, ${report.errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Alert check completed. ${report.alertsSent} alerts sent out of ${report.totalChecks} subscriptions.`,
      summary: {
        totalChecks: report.totalChecks,
        alertsSent: report.alertsSent,
        errors: report.errors,
        duration: report.endTime.getTime() - report.startTime.getTime(),
      },
    });

  } catch (error) {
    console.error('Error in scheduled alert check:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
