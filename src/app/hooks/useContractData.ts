import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Contract ABIs
const POOL_ABI = [
  'function supplyRate() public view returns (uint256)',
  'function utilizationRate() public view returns (uint256)',
  'event RateUpdated(uint256 indexed newRate, uint256 indexed newUtil)',
];

const VAULT_ABI = [
  'function totalAssets() public view returns (uint256)',
  'function balanceOf(address) public view returns (uint256)',
  'function asset() public view returns (address)',
  'function convertToAssets(uint256 shares) public view returns (uint256)',
  'event StrategyExecuted(address fromPool, address toPool, uint256 amount, string reason)',
  'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)'
];

const USDC_ABI = [
  'function balanceOf(address) public view returns (uint256)',
  'function decimals() public view returns (uint8)',
];

const SENTINEL_ABI = [
  'event Callback(uint256 indexed chainId, address indexed target, uint256 gasLimit, bytes payload)'
];

// Contract Addresses (Sepolia)
const POOL_A_ADDRESS = '0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47';
const POOL_B_ADDRESS = '0xBE2bcf983b84c030b0C851989aDF351816fA21D2';
const VAULT_ADDRESS = '0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66';
const USDC_ADDRESS = '0x1C512b73599bB25aee2feE72f335Ccb9281f33D2';
const SENTINEL_ADDRESS = '0xdde26714a634370A0fb9Ff49Df07Ec2A5cF28f5d';

// RPC Endpoint
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const LASNA_RPC = 'https://lasna-rpc.rnk.dev/';

export interface PoolData {
  supplyRate: number; // in bps
  utilizationRate: number; // in bps
}

export interface VaultData {
  totalAssets: number;
  userBalance: number;
  underlyingValue: number;
}

export interface BlockchainState {
  poolA: PoolData | null;
  poolB: PoolData | null;
  vault: VaultData | null;
  sentinelConnected: boolean;
  loading: boolean;
  error: string | null;
}

export const useContractData = (userAddress?: string | null) => {
  const [state, setState] = useState<BlockchainState>({
    poolA: null,
    poolB: null,
    vault: null,
    sentinelConnected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Disable batching to avoid "Batch of more than 3 requests" error on free tier
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC, undefined, { batchMaxCount: 1 });

        // Helper to safely fetch pool data
        const fetchPoolData = async (address: string) => {
          try {
            const contract = new ethers.Contract(address, POOL_ABI, provider);
            const [supplyRate, utilRate] = await Promise.all([
              contract.supplyRate(),
              contract.utilizationRate()
            ]);
            return {
              supplyRate: Number(supplyRate),
              utilizationRate: Number(utilRate)
            };
          } catch (e) {
            console.error(`Failed to fetch pool data for ${address}`, e);
            return null;
          }
        };

        const [poolAData, poolBData] = await Promise.all([
          fetchPoolData(POOL_A_ADDRESS),
          fetchPoolData(POOL_B_ADDRESS)
        ]);

        // Fetch Vault data
        let vaultData = null;
        try {
          const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
          const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
          
          const [totalAssetsRaw, decimals] = await Promise.all([
            vaultContract.totalAssets(),
            usdcContract.decimals()
          ]);

          const totalAssets = parseFloat(ethers.formatUnits(totalAssetsRaw, decimals));
          
          let userBalance = 0;
          let underlyingValue = 0;

          if (userAddress) {
            const balanceRaw = await vaultContract.balanceOf(userAddress);
            userBalance = parseFloat(ethers.formatUnits(balanceRaw, decimals));
            
            const assetsRaw = await vaultContract.convertToAssets(balanceRaw);
            underlyingValue = parseFloat(ethers.formatUnits(assetsRaw, decimals));
          }

          vaultData = {
            totalAssets,
            userBalance,
            underlyingValue,
          };
        } catch (e) {
          console.error('Failed to fetch vault data', e);
        }

        // Check Sentinel connection (Lasna)
        let sentinelConnected = false;
        try {
          const lasnaProvider = new ethers.JsonRpcProvider(LASNA_RPC);
          await lasnaProvider.getBalance(SENTINEL_ADDRESS);
          sentinelConnected = true;
        } catch (err) {
          console.warn('Sentinel connection check failed', err);
        }

        setState({
          poolA: poolAData,
          poolB: poolBData,
          vault: vaultData,
          sentinelConnected,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error?.message || 'Failed to fetch contract data',
        }));
      }
    };

    // Fetch immediately
    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [userAddress]);

  return state;
};

// Global event callbacks registry
type EventCallback = (type: 'RATE_UPDATE' | 'STRATEGY_EXECUTION' | 'DEPOSIT' | 'WITHDRAW' | 'REACTIVE_CALLBACK', data: any) => void;
const eventCallbacks = new Set<EventCallback>();

// Singleton Poller State
let isPolling = false;
let lastBlock = 0;
let lastLasnaBlock = 0;
let lastPoolA: PoolData | null = null;
let lastPoolB: PoolData | null = null;
let tokenDecimals = 18; // Default to 18, will be updated
let decimalsFetched = false;

const startPolling = () => {
    if (isPolling) return;
    isPolling = true;

    // Sepolia Polling
    setInterval(async () => {
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        
        // Fetch decimals once
        if (!decimalsFetched) {
            try {
                const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
                tokenDecimals = Number(await usdcContract.decimals());
                decimalsFetched = true;
            } catch (e) {
                console.warn('Failed to fetch decimals in poller, using default 18', e);
            }
        }

        const currentBlock = await provider.getBlockNumber();
        
        if (lastBlock === 0) {
            lastBlock = currentBlock - 50; // Look back 50 blocks initially
        }

        const poolAContract = new ethers.Contract(POOL_A_ADDRESS, POOL_ABI, provider);
        const supplyRateA = Number(await poolAContract.supplyRate());
        const utilRateA = Number(await poolAContract.utilizationRate());

        const poolBContract = new ethers.Contract(POOL_B_ADDRESS, POOL_ABI, provider);
        const supplyRateB = Number(await poolBContract.supplyRate());
        const utilRateB = Number(await poolBContract.utilizationRate());

        // Detect Pool A change
        if (lastPoolA && (lastPoolA.supplyRate !== supplyRateA || lastPoolA.utilizationRate !== utilRateA)) {
          eventCallbacks.forEach(cb => cb('RATE_UPDATE', { pool: 'A', rate: supplyRateA, util: utilRateA }));
        }
        lastPoolA = { supplyRate: supplyRateA, utilizationRate: utilRateA };

        // Detect Pool B change
        if (lastPoolB && (lastPoolB.supplyRate !== supplyRateB || lastPoolB.utilizationRate !== utilRateB)) {
          eventCallbacks.forEach(cb => cb('RATE_UPDATE', { pool: 'B', rate: supplyRateB, util: utilRateB }));
        }
        lastPoolB = { supplyRate: supplyRateB, utilizationRate: utilRateB };

        // Listen for Vault Events
        const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
        
        if (currentBlock > lastBlock) {
            // 1. StrategyExecuted
            const eventsStrategy = await vaultContract.queryFilter(vaultContract.filters.StrategyExecuted(), lastBlock + 1, currentBlock);
            eventsStrategy.forEach((event: any) => {
                if (event.args) {
                    eventCallbacks.forEach(cb => cb('STRATEGY_EXECUTION', {
                        fromPool: event.args[0],
                        toPool: event.args[1],
                        amount: ethers.formatUnits(event.args[2], tokenDecimals),
                        reason: event.args[3],
                        txHash: event.transactionHash,
                        timestamp: new Date().toLocaleTimeString()
                    }));
                }
            });

            // 2. Deposit
            const eventsDeposit = await vaultContract.queryFilter(vaultContract.filters.Deposit(), lastBlock + 1, currentBlock);
            eventsDeposit.forEach((event: any) => {
                if (event.args) {
                    eventCallbacks.forEach(cb => cb('DEPOSIT', {
                        sender: event.args[0],
                        owner: event.args[1],
                        assets: ethers.formatUnits(event.args[2], tokenDecimals),
                        shares: ethers.formatUnits(event.args[3], tokenDecimals),
                        txHash: event.transactionHash,
                        timestamp: new Date().toLocaleTimeString()
                    }));
                }
            });

            // 3. Withdraw
            const eventsWithdraw = await vaultContract.queryFilter(vaultContract.filters.Withdraw(), lastBlock + 1, currentBlock);
            eventsWithdraw.forEach((event: any) => {
                if (event.args) {
                    eventCallbacks.forEach(cb => cb('WITHDRAW', {
                        sender: event.args[0],
                        receiver: event.args[1],
                        owner: event.args[2],
                        assets: ethers.formatUnits(event.args[3], tokenDecimals),
                        shares: ethers.formatUnits(event.args[4], tokenDecimals),
                        txHash: event.transactionHash,
                        timestamp: new Date().toLocaleTimeString()
                    }));
                }
            });

            lastBlock = currentBlock;
        }

      } catch (err) {
        console.error('Error polling contract events:', err);
      }
    }, 5000);

    // Lasna Polling
    setInterval(async () => {
        try {
            const lasnaProvider = new ethers.JsonRpcProvider(LASNA_RPC);
            const currentLasnaBlock = await lasnaProvider.getBlockNumber();
            
            if (lastLasnaBlock === 0) {
                lastLasnaBlock = currentLasnaBlock - 50;
            }

            const sentinelContract = new ethers.Contract(SENTINEL_ADDRESS, SENTINEL_ABI, lasnaProvider);
            
            if (currentLasnaBlock > lastLasnaBlock) {
                try {
                    const events = await sentinelContract.queryFilter(sentinelContract.filters.Callback(), lastLasnaBlock + 1, currentLasnaBlock);
                    events.forEach((event: any) => {
                        eventCallbacks.forEach(cb => cb('REACTIVE_CALLBACK', {
                            chainId: event.args[0],
                            target: event.args[1],
                            txHash: event.transactionHash,
                            timestamp: new Date().toLocaleTimeString()
                        }));
                    });
                    lastLasnaBlock = currentLasnaBlock;
                } catch (filterError: any) {
                    // Suppress "block not found" errors common with public RPCs
                    if (filterError?.message?.includes('block not found') || filterError?.info?.error?.message?.includes('block not found')) {
                        console.warn('Lasna RPC syncing, retrying next cycle...');
                        return;
                    }
                    throw filterError;
                }
            }
        } catch (err) {
            console.error('Error polling Lasna events:', err);
        }
    }, 5000);
};

// Hook for listening to blockchain events
export const useContractEvents = (callback: EventCallback) => {
  useEffect(() => {
    eventCallbacks.add(callback);
    startPolling(); // Ensure polling is started

    return () => {
      eventCallbacks.delete(callback);
    };
  }, [callback]);
};
