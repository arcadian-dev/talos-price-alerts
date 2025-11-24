import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserSubscription } from '@/models';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email(),
  productId: z.string().min(1).optional(),
});

// POST /api/subscriptions/unsubscribe - Unsubscribe from alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    await dbConnect();

    if (validatedData.productId) {
      // Unsubscribe from specific product
      const subscription = await UserSubscription.findOne({
        email: validatedData.email,
        productId: validatedData.productId,
      });

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      subscription.isActive = false;
      await subscription.save();

      return NextResponse.json({
        message: 'Successfully unsubscribed from product alerts',
      });
    } else {
      // Unsubscribe from all alerts for this email
      await UserSubscription.updateMany(
        { email: validatedData.email },
        { isActive: false }
      );

      return NextResponse.json({
        message: 'Successfully unsubscribed from all alerts',
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
