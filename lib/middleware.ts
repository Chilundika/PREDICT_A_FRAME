import { NextRequest, NextResponse } from 'next/server';
import { isAddressAllowed } from '@/lib/config';

/**
 * Middleware to check if the requesting address is allowed
 * This can be used to protect API routes or specific pages
 */
export function withAddressValidation(
  handler: (request: NextRequest, address: string) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    try {
      // Extract address from various sources
      const address = extractAddressFromRequest(request);
      
      if (!address) {
        return NextResponse.json(
          { error: 'Address not provided' },
          { status: 400 }
        );
      }

      if (!isAddressAllowed(address)) {
        return NextResponse.json(
          { error: 'Address not allowed' },
          { status: 403 }
        );
      }

      return await handler(request, address);
    } catch (error) {
      console.error('Address validation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract wallet address from request
 * Supports multiple methods: headers, query params, body
 */
function extractAddressFromRequest(request: NextRequest): string | null {
  // Try to get from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // If it's a wallet address format, use it directly
    if (/^0x[a-fA-F0-9]{40}$/.test(token)) {
      return token.toLowerCase();
    }
  }

  // Try to get from custom header
  const addressHeader = request.headers.get('x-wallet-address');
  if (addressHeader && /^0x[a-fA-F0-9]{40}$/.test(addressHeader)) {
    return addressHeader.toLowerCase();
  }

  // Try to get from query parameters
  const url = new URL(request.url);
  const addressParam = url.searchParams.get('address');
  if (addressParam && /^0x[a-fA-F0-9]{40}$/.test(addressParam)) {
    return addressParam.toLowerCase();
  }

  return null;
}

/**
 * Middleware specifically for API routes that need wallet address validation
 */
export function createAddressProtectedRoute(
  handler: (request: NextRequest, address: string) => Promise<NextResponse> | NextResponse
) {
  return withAddressValidation(handler);
}
