import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserSubscription, Product } from '@/models';
import { z } from 'zod';
import crypto from 'crypto';

const subscriptionSchema = z.object({
  email: z.string().email(),
  productId: z.string().min(1),
  alertType: z.enum(['price_drop', 'new_vendor', 'weekly_digest', 'all']).optional(),
  alertThreshold: z.number().min(0).optional(),
});

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    await dbConnect();

    // Verify product exists
    const product = await Product.findById(validatedData.productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if subscription already exists
    const existingSubscription = await UserSubscription.findOne({
      email: validatedData.email,
      productId: validatedData.productId,
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.alertType = validatedData.alertType || 'all';
      existingSubscription.alertThreshold = validatedData.alertThreshold;
      existingSubscription.isActive = true;
      await existingSubscription.save();

      return NextResponse.json({
        message: 'Subscription updated successfully',
        subscription: existingSubscription,
      });
    }

    // Create new subscription
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const subscription = new UserSubscription({
      email: validatedData.email,
      productId: validatedData.productId,
      alertType: validatedData.alertType || 'all',
      alertThreshold: validatedData.alertThreshold,
      verificationToken,
      isActive: true,
      isVerified: false, // Will be verified via email
    });

    await subscription.save();

    // TODO: Send verification email
    console.log(`Verification email would be sent to ${validatedData.email} with token ${verificationToken}`);

    return NextResponse.json({
      message: 'Subscription created successfully. Please check your email to verify.',
      subscription: {
        id: subscription._id,
        email: subscription.email,
        productName: product.name,
        alertType: subscription.alertType,
      },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/subscriptions?email=user@example.com - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    await dbConnect();

    const subscriptions = await UserSubscription.find({ email })
      .populate('productId', 'name slug category unit')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ subscriptions });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
