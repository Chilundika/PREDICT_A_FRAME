import { NextRequest, NextResponse } from 'next/server';
import { isAddressAllowed } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const allowed = isAddressAllowed(address);

    return NextResponse.json({
      allowed,
      address: address.toLowerCase()
    });
  } catch (error) {
    console.error('Address validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract address from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const address = authHeader.substring(7);
    const allowed = isAddressAllowed(address);

    return NextResponse.json({
      allowed,
      address: address.toLowerCase()
    });
  } catch (error) {
    console.error('Address validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
