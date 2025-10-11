# BaseBuilder Configuration Usage Guide

This guide explains how to use the BaseBuilder access control system implemented in this project.

## Overview

The BaseBuilder configuration provides address-based access control for your MiniKit application. It allows you to restrict certain features to specific wallet addresses.

## Configuration

### Default Configuration

The default configuration is defined in `lib/config.ts`:

```typescript
const defaultConfig: AppConfig = {
  baseBuilder: {
    allowedAddresses: ["0xA67323BE0685019F6B7D2dF308E17e3C00958b05"]
  }
};
```

### Environment Variable Configuration

You can override the default configuration using environment variables:

```bash
# Single address
BASE_BUILDER_ALLOWED_ADDRESSES=0xA67323BE0685019F6B7D2dF308E17e3C00958b05

# Multiple addresses (comma-separated)
BASE_BUILDER_ALLOWED_ADDRESSES=0xA67323BE0685019F6B7D2dF308E17e3C00958b05,0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

## Usage Examples

### 1. Protecting API Routes

#### Using Middleware (Automatic)
Routes under `/api/protected/` are automatically protected:

```typescript
// This route is automatically protected by middleware
// POST /api/protected/example
// Headers: Authorization: Bearer 0xA67323BE0685019F6B7D2dF308E17e3C00958b05
```

#### Manual Protection
```typescript
import { createAddressProtectedRoute } from '@/lib/middleware';

const handler = async (request: NextRequest, address: string) => {
  // Your protected logic here
  return NextResponse.json({ success: true, address });
};

export const POST = createAddressProtectedRoute(handler);
```

### 2. Frontend Components

#### Using AddressValidation Component
```tsx
import { AddressValidation } from '@/app/components/AddressValidation';

function MyComponent() {
  return (
    <AddressValidation fallback={<div>Access denied</div>}>
      <div>This content is only visible to authorized addresses</div>
    </AddressValidation>
  );
}
```

#### Using the Hook
```tsx
import { useAddressValidation } from '@/app/components/AddressValidation';

function MyComponent() {
  const { isAllowed, isLoading, address } = useAddressValidation();

  if (isLoading) return <div>Checking permissions...</div>;
  if (!isAllowed) return <div>Access denied</div>;

  return <div>Welcome, {address}!</div>;
}
```

### 3. Direct Validation

```typescript
import { isAddressAllowed, getAllowedAddresses } from '@/lib/config';

// Check if an address is allowed
const isAllowed = isAddressAllowed('0xA67323BE0685019F6B7D2dF308E17e3C00958b05');

// Get all allowed addresses
const allowedAddresses = getAllowedAddresses();
```

## API Endpoints

### Validate Address
- **POST** `/api/validate-address`
- **GET** `/api/validate-address` (with Authorization header)

```bash
# POST request
curl -X POST /api/validate-address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 0xA67323BE0685019F6B7D2dF308E17e3C00958b05" \
  -d '{"address": "0xA67323BE0685019F6B7D2dF308E17e3C00958b05"}'

# Response
{
  "allowed": true,
  "address": "0xa67323be0685019f6b7d2df308e17e3c00958b05"
}
```

### Protected Routes
- **POST** `/api/protected/example`
- **GET** `/api/protected/example`

Requires Authorization header with allowed wallet address.

## Security Considerations

1. **Address Validation**: All addresses are validated using regex pattern `/^0x[a-fA-F0-9]{40}$/`
2. **Case Insensitive**: Addresses are normalized to lowercase for comparison
3. **Environment Variables**: Sensitive configuration should be stored in environment variables
4. **Middleware Protection**: Routes under `/api/protected/` are automatically protected

## Error Responses

- **400**: Address not provided or invalid format
- **401**: Authorization header missing or invalid
- **403**: Address not in allowed list
- **500**: Internal server error

## Integration with Existing Features

The BaseBuilder configuration integrates with:
- **Webhook Handler**: Validates wallet addresses in Farcaster events
- **MiniKit Provider**: Can be extended to restrict frame access
- **Notification System**: Can be used to limit notification recipients
- **Wallet Connection**: Validates connected wallet addresses
