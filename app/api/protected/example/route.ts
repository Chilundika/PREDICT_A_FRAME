import { NextRequest, NextResponse } from 'next/server';
import { createAddressProtectedRoute } from '@/lib/middleware';

// Example protected API route that requires address validation
const handler = async (request: NextRequest, address: string) => {
  try {
    const body = await request.json();
    
    // Your protected logic here
    console.log(`Protected action executed by address: ${address}`);
    
    return NextResponse.json({
      success: true,
      message: `Action completed for address: ${address}`,
      data: body
    });
  } catch (error) {
    console.error('Protected route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const POST = createAddressProtectedRoute(handler);
export const GET = createAddressProtectedRoute(handler);
