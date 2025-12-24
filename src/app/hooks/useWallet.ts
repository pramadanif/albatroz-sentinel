'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string | null;
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
}

const SEPOLIA_CHAIN_ID = 11155111;

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
    signer: null,
    provider: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not installed');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(address);

        setWallet({
          address,
          isConnected: true,
          chainId: Number(network.chainId),
          balance: ethers.formatEther(balance),
          signer,
          provider,
        });

        // Check chain
        if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
          setError(`Wrong chain. Please switch to Sepolia (ID: ${SEPOLIA_CHAIN_ID})`);
        } else {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Wallet check error:', err);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = accounts[0];
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      // Check if on correct chain
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        // Try to switch chain
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, try to add it
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia',
                  rpcUrls: ['https://sepolia.drpc.org'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          }
        }
      }

      setWallet({
        address,
        isConnected: true,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        signer,
        provider,
      });
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMsg);
      console.error('Wallet connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
      signer: null,
      provider: null,
    });
    setError(null);
  };

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        checkWalletConnection();
      }
    };

    const handleChainChanged = () => {
      checkWalletConnection();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    ...wallet,
    connect,
    disconnect,
    error,
    isConnecting,
  };
};
