"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface AddressValidationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on address validation
 * Uses the baseBuilder configuration to check if the connected wallet is allowed
 */
export function AddressValidation({ children, fallback }: AddressValidationProps) {
  const { address, isConnected } = useAccount();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsAllowed(false);
      return;
    }

    // Check if address is allowed by calling our API
    checkAddressPermission(address).then(setIsAllowed);
  }, [address, isConnected]);

  if (!isConnected) {
    return fallback || <div>Please connect your wallet</div>;
  }

  if (isAllowed === null) {
    return <div>Checking permissions...</div>;
  }

  if (!isAllowed) {
    return fallback || (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-semibold">Access Denied</h3>
        <p className="text-red-600 text-sm">
          Your wallet address ({address}) is not authorized to access this feature.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if the current connected address is allowed
 */
export function useAddressValidation() {
  const { address, isConnected } = useAccount();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsAllowed(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    checkAddressPermission(address)
      .then(setIsAllowed)
      .finally(() => setIsLoading(false));
  }, [address, isConnected]);

  return {
    isAllowed,
    isLoading,
    address,
    isConnected
  };
}

/**
 * Check if an address has permission by calling our validation API
 */
async function checkAddressPermission(address: string): Promise<boolean> {
  try {
    const response = await fetch('/api/validate-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${address}`,
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.allowed || false;
  } catch (error) {
    console.error('Address validation error:', error);
    return false;
  }
}
