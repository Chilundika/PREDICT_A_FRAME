import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime compatible address validation
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isAddressAllowed(address: string): boolean {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  
  // Hardcoded allowed addresses for Edge Runtime compatibility
  const allowedAddresses = ["0xA67323BE0685019F6B7D2dF308E17e3C00958b05"];
  return allowedAddresses.includes(address.toLowerCase());
}

export function middleware(request: NextRequest) {
  // Only apply to API routes that need address validation
  if (request.nextUrl.pathname.startsWith('/api/protected/')) {
    const address = extractAddressFromRequest(request);
    
    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (!isAddressAllowed(address)) {
      return NextResponse.json(
        { error: 'Address not authorized' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

function extractAddressFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (/^0x[a-fA-F0-9]{40}$/.test(token)) {
      return token.toLowerCase();
    }
  }

  // Try custom header
  const addressHeader = request.headers.get('x-wallet-address');
  if (addressHeader && /^0x[a-fA-F0-9]{40}$/.test(addressHeader)) {
    return addressHeader.toLowerCase();
  }

  // Try query parameter
  const addressParam = request.nextUrl.searchParams.get('address');
  if (addressParam && /^0x[a-fA-F0-9]{40}$/.test(addressParam)) {
    return addressParam.toLowerCase();
  }

  return null;
}

export const config = {
  matcher: [
    '/api/protected/:path*',
  ],
};
