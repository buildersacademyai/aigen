import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Web3State {
  address: string | null;
  isConnecting: boolean;
  error: Error | null;
}

export function useWeb3() {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Query for wallet address
  const { data: address, error } = useQuery<string | null, Error>({
    queryKey: ['wallet-address'],
    queryFn: async () => {
      // For now, we'll just check local storage
      const savedAddress = localStorage.getItem('wallet-address');
      return savedAddress;
    },
    staleTime: Infinity,
  });

  const connect = async () => {
    try {
      setIsConnecting(true);
      
      // Check if window.ethereum is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install a Web3 wallet (e.g., MetaMask) to continue');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const connectedAddress = accounts[0];
      
      // Save to local storage
      localStorage.setItem('wallet-address', connectedAddress);
      
      // Update the query cache
      queryClient.setQueryData(['wallet-address'], connectedAddress);

      return connectedAddress;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('wallet-address');
    queryClient.setQueryData(['wallet-address'], null);
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else {
        // Account changed
        const newAddress = accounts[0];
        localStorage.setItem('wallet-address', newAddress);
        queryClient.setQueryData(['wallet-address'], newAddress);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [queryClient]);

  return {
    address: address ?? null,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
