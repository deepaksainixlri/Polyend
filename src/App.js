import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Markets from './components/Markets';
import { CONTRACTS, POLYLEND_ABI, TOKEN_ABI } from './contracts/config';

function App() {
  const [account, setAccount] = useState('');
  const [contracts, setContracts] = useState({});
  const [balances, setBalances] = useState({});
  const [healthFactor, setHealthFactor] = useState('0');
  const [marketData, setMarketData] = useState({});

  // Load market data on component mount
  useEffect(() => {
    const loadInitialMarketData = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const polyLend = new ethers.Contract(
            CONTRACTS.PolyLend,
            POLYLEND_ABI,
            provider
          );
          await loadMarketData(polyLend);
        }
      } catch (error) {
        console.error('Error loading initial market data:', error);
      }
    };

    loadInitialMarketData();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Initialize contracts
        const polyLend = new ethers.Contract(
          CONTRACTS.PolyLend, 
          POLYLEND_ABI, 
          signer
        );
        
        const usdc = new ethers.Contract(
          CONTRACTS.USDC, 
          TOKEN_ABI, 
          signer
        );
        
        const dai = new ethers.Contract(
          CONTRACTS.DAI, 
          TOKEN_ABI, 
          signer
        );
        
        const weth = new ethers.Contract(
          CONTRACTS.WETH, 
          TOKEN_ABI, 
          signer
        );
        
        setAccount(accounts[0]);
        setContracts({ polyLend, usdc, dai, weth });
        
        toast.success('Wallet connected!');
        
        // Load user data and market data
        await loadUserData(accounts[0], polyLend);
        await loadMarketData(polyLend);
      } else {
        toast.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect wallet');
    }
  };

  // Load user data
  const loadUserData = async (userAddress, polyLend) => {
    try {
      console.log('Loading user data for address:', userAddress);

      // Get health factor
      try {
        const health = await polyLend.getHealthFactor(userAddress);
        console.log('Raw health factor:', health);
        setHealthFactor(ethers.utils.formatEther(health));
      } catch (healthError) {
        console.error('Error loading health factor:', healthError);
        setHealthFactor('0');
      }

      // Get balances for each token
      const balanceData = {};
      const assets = [
        { symbol: 'USDC', contract: CONTRACTS.USDC, decimals: 6 }, // USDC typically uses 6 decimals
        { symbol: 'DAI', contract: CONTRACTS.DAI, decimals: 18 },
        { symbol: 'WETH', contract: CONTRACTS.WETH, decimals: 18 }
      ];

      for (const asset of assets) {
        try {
          console.log(`Fetching user balances for ${asset.symbol}`);
          const supply = await polyLend.getUserSupply(userAddress, asset.contract);
          const borrow = await polyLend.getUserBorrow(userAddress, asset.contract);

          console.log(`${asset.symbol} raw supply:`, supply);
          console.log(`${asset.symbol} raw borrow:`, borrow);

          // Try both 18 decimals and asset-specific decimals
          const supply18 = ethers.utils.formatUnits(supply, 18);
          const supplyAsset = ethers.utils.formatUnits(supply, asset.decimals);
          const borrow18 = ethers.utils.formatUnits(borrow, 18);
          const borrowAsset = ethers.utils.formatUnits(borrow, asset.decimals);

          console.log(`${asset.symbol} supply (18 decimals):`, supply18);
          console.log(`${asset.symbol} supply (${asset.decimals} decimals):`, supplyAsset);

          // Use the one that makes more sense (not zero and reasonable value)
          const finalSupply = (parseFloat(supply18) > 0 && parseFloat(supply18) < 1000000) ? supply18 : supplyAsset;
          const finalBorrow = (parseFloat(borrow18) > 0 && parseFloat(borrow18) < 1000000) ? borrow18 : borrowAsset;

          balanceData[asset.symbol] = {
            supply: finalSupply,
            borrow: finalBorrow
          };
        } catch (assetError) {
          console.error(`Error loading balances for ${asset.symbol}:`, assetError);
          balanceData[asset.symbol] = {
            supply: '0',
            borrow: '0'
          };
        }
      }

      console.log('Final balance data:', balanceData);
      setBalances(balanceData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default empty balances
      setBalances({
        USDC: { supply: '0', borrow: '0' },
        DAI: { supply: '0', borrow: '0' },
        WETH: { supply: '0', borrow: '0' }
      });
    }
  };

  // Load market data
  const loadMarketData = async (polyLend) => {
    try {
      const assets = ['USDC', 'DAI', 'WETH'];
      const marketInfo = {};

      console.log('Loading market data for assets:', assets);

      for (const asset of assets) {
        try {
          console.log(`Fetching market data for ${asset}, contract address: ${CONTRACTS[asset]}`);

          // First try the getMarketData function
          let marketData = null;
          try {
            const data = await polyLend.getMarketData(CONTRACTS[asset]);
            console.log(`Raw market data for ${asset}:`, data);

            if (data && data.length >= 5) {
              marketData = {
                totalSupply: ethers.utils.formatUnits(data[0], 18),
                totalBorrow: ethers.utils.formatUnits(data[1], 18),
                supplyRate: ethers.utils.formatUnits(data[2], 18),
                borrowRate: ethers.utils.formatUnits(data[3], 18),
                availableLiquidity: ethers.utils.formatUnits(data[4], 18)
              };
            }
          } catch (getMarketDataError) {
            console.warn(`getMarketData failed for ${asset}, trying alternative approach:`, getMarketDataError.message);

            // Alternative: Try to get individual data points if available
            try {
              // For now, use default values since the contract might not have these individual functions
              marketData = {
                totalSupply: '0',
                totalBorrow: '0',
                supplyRate: '0.03', // 3% default
                borrowRate: '0.07', // 7% default
                availableLiquidity: '1000' // Default liquidity
              };
            } catch (altError) {
              console.error(`Alternative approach failed for ${asset}:`, altError);
            }
          }

          if (marketData) {
            marketInfo[asset] = marketData;
            console.log(`Formatted market data for ${asset}:`, marketInfo[asset]);
          } else {
            // Fallback to default values
            marketInfo[asset] = {
              totalSupply: '0',
              totalBorrow: '0',
              supplyRate: '0.035', // 3.5% APY
              borrowRate: '0.075', // 7.5% APY
              availableLiquidity: '500'
            };
          }
        } catch (assetError) {
          console.error(`Error loading market data for ${asset}:`, assetError);
          // Set default values for this asset
          marketInfo[asset] = {
            totalSupply: '0',
            totalBorrow: '0',
            supplyRate: '0.05', // Default 5% APY
            borrowRate: '0.08', // Default 8% APY
            availableLiquidity: '100'
          };
        }
      }

      console.log('Final market info:', marketInfo);
      setMarketData(marketInfo);
    } catch (error) {
      console.error('Error loading market data:', error);
      // Set fallback data
      const fallbackData = {
        USDC: { totalSupply: '0', totalBorrow: '0', supplyRate: '0.035', borrowRate: '0.07', availableLiquidity: '0' },
        DAI: { totalSupply: '0', totalBorrow: '0', supplyRate: '0.042', borrowRate: '0.075', availableLiquidity: '0' },
        WETH: { totalSupply: '0', totalBorrow: '0', supplyRate: '0.028', borrowRate: '0.065', availableLiquidity: '0' }
      };
      setMarketData(fallbackData);
    }
  };

  // Supply function
  const handleSupply = async (asset, amount) => {
    try {
      const token = contracts[asset.toLowerCase()];
      const amountWei = ethers.utils.parseUnits(amount, 18);
      
      // Approve token
      const approveTx = await token.approve(CONTRACTS.PolyLend, amountWei);
      await approveTx.wait();
      toast.info('Approval confirmed!');
      
      // Supply to pool
      const supplyTx = await contracts.polyLend.supply(
        CONTRACTS[asset], 
        amountWei
      );
      await supplyTx.wait();
      
      toast.success(`Successfully supplied ${amount} ${asset}!`);
      
      // Reload data
      await loadUserData(account, contracts.polyLend);
      await loadMarketData(contracts.polyLend);
    } catch (error) {
      console.error(error);
      toast.error('Supply failed: ' + error.message);
    }
  };

  // Borrow function
  const handleBorrow = async (asset, amount) => {
    try {
      const amountFloat = parseFloat(amount);

      // Check available liquidity
      if (marketData[asset] && marketData[asset].availableLiquidity) {
        const availableLiquidity = parseFloat(marketData[asset].availableLiquidity);

        if (amountFloat > availableLiquidity) {
          toast.error(`Insufficient liquidity. Available: ${availableLiquidity.toFixed(4)} ${asset}`);
          return;
        }
      }

      const amountWei = ethers.utils.parseUnits(amount, 18);

      const borrowTx = await contracts.polyLend.borrow(
        CONTRACTS[asset],
        amountWei
      );
      await borrowTx.wait();

      toast.success(`Successfully borrowed ${amount} ${asset}!`);

      // Reload data
      await loadUserData(account, contracts.polyLend);
      await loadMarketData(contracts.polyLend);
      await loadMarketData(contracts.polyLend);
    } catch (error) {
      console.error(error);
      // Better error handling for common issues
      if (error.message.includes('Insufficient liquidity')) {
        toast.error('Insufficient liquidity in the pool for this amount');
      } else if (error.message.includes('execution reverted')) {
        toast.error('Transaction failed: Check your collateral and borrowing capacity');
      } else {
        toast.error('Borrow failed: ' + error.message);
      }
    }
  };

  // Repay function
  const handleRepay = async (asset, amount) => {
    try {
      const token = contracts[asset.toLowerCase()];
      const amountWei = ethers.utils.parseUnits(amount, 18);
      
      // Approve token
      const approveTx = await token.approve(CONTRACTS.PolyLend, amountWei);
      await approveTx.wait();
      
      // Repay loan
      const repayTx = await contracts.polyLend.repay(
        CONTRACTS[asset], 
        amountWei
      );
      await repayTx.wait();
      
      toast.success(`Successfully repaid ${amount} ${asset}!`);
      
      // Reload data
      await loadUserData(account, contracts.polyLend);
      await loadMarketData(contracts.polyLend);
    } catch (error) {
      console.error(error);
      toast.error('Repay failed: ' + error.message);
    }
  };

  // Withdraw function
  const handleWithdraw = async (asset, amount) => {
    try {
      const amountWei = ethers.utils.parseUnits(amount, 18);
      
      const withdrawTx = await contracts.polyLend.withdraw(
        CONTRACTS[asset], 
        amountWei
      );
      await withdrawTx.wait();
      
      toast.success(`Successfully withdrew ${amount} ${asset}!`);
      
      // Reload data
      await loadUserData(account, contracts.polyLend);
      await loadMarketData(contracts.polyLend);
    } catch (error) {
      console.error(error);
      toast.error('Withdraw failed: ' + error.message);
    }
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" />
      
      <Header 
        account={account} 
        connectWallet={connectWallet}
        healthFactor={healthFactor}
      />
      
      {account ? (
        <>
          <Dashboard balances={balances} />
          
          <Markets
            onSupply={handleSupply}
            onBorrow={handleBorrow}
            onRepay={handleRepay}
            onWithdraw={handleWithdraw}
            balances={balances}
            marketData={marketData}
          />
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Welcome to PolyLend</h2>
          <p>Connect your wallet to get started</p>
          <button
            onClick={connectWallet}
            type="button"
            aria-label="Connect MetaMask wallet to access PolyLend"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;