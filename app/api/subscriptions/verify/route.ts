import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserSubscription } from '@/models';

// GET /api/subscriptions/verify?token=xxx - Verify email subscription
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    await dbConnect();

    const subscription = await UserSubscription.findOne({ verificationToken: token })
      .populate('productId', 'name slug');

    if (!subscription) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 404 });
    }

    if (subscription.isVerified) {
      return NextResponse.json({ 
        message: 'Email already verified',
        subscription: {
          email: subscription.email,
          productName: subscription.productId.name,
          verified: true,
        }
      });
    }

    // Verify the subscription
    subscription.isVerified = true;
    subscription.verificationToken = undefined;
    await subscription.save();

    return NextResponse.json({
      message: 'Email verified successfully! You will now receive price alerts.',
      subscription: {
        email: subscription.email,
        productName: subscription.productId.name,
        verified: true,
      }
    });

  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
