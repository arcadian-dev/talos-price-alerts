import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Check if MONGODB_URI is set
    const mongoUri = process.env.MONGODB_URI;
    console.log('MONGODB_URI exists:', !!mongoUri);
    console.log('MONGODB_URI (first 20 chars):', mongoUri?.substring(0, 20));
    
    // Try to connect
    await dbConnect();
    console.log('Database connection successful');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      mongoUriExists: !!mongoUri
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      mongoUriExists: !!process.env.MONGODB_URI
    }, { status: 500 });
  }
}
