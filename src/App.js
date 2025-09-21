import React, { useState } from 'react';
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
        
        // Load user data
        await loadUserData(accounts[0], polyLend);
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
      // Get health factor
      const health = await polyLend.getHealthFactor(userAddress);
      setHealthFactor(ethers.utils.formatEther(health));
      
      // Get balances for each token
      const usdcSupply = await polyLend.getUserSupply(userAddress, CONTRACTS.USDC);
      const usdcBorrow = await polyLend.getUserBorrow(userAddress, CONTRACTS.USDC);
      
      const daiSupply = await polyLend.getUserSupply(userAddress, CONTRACTS.DAI);
      const daiBorrow = await polyLend.getUserBorrow(userAddress, CONTRACTS.DAI);
      
      const wethSupply = await polyLend.getUserSupply(userAddress, CONTRACTS.WETH);
      const wethBorrow = await polyLend.getUserBorrow(userAddress, CONTRACTS.WETH);
      
      setBalances({
        USDC: {
          supply: ethers.utils.formatUnits(usdcSupply, 18),
          borrow: ethers.utils.formatUnits(usdcBorrow, 18)
        },
        DAI: {
          supply: ethers.utils.formatUnits(daiSupply, 18),
          borrow: ethers.utils.formatUnits(daiBorrow, 18)
        },
        WETH: {
          supply: ethers.utils.formatUnits(wethSupply, 18),
          borrow: ethers.utils.formatUnits(wethBorrow, 18)
        }
      });
    } catch (error) {
      console.error('Error loading user data:', error);
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
    } catch (error) {
      console.error(error);
      toast.error('Supply failed: ' + error.message);
    }
  };

  // Borrow function
  const handleBorrow = async (asset, amount) => {
    try {
      const amountWei = ethers.utils.parseUnits(amount, 18);
      
      const borrowTx = await contracts.polyLend.borrow(
        CONTRACTS[asset], 
        amountWei
      );
      await borrowTx.wait();
      
      toast.success(`Successfully borrowed ${amount} ${asset}!`);
      
      // Reload data
      await loadUserData(account, contracts.polyLend);
    } catch (error) {
      console.error(error);
      toast.error('Borrow failed: ' + error.message);
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
          />
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Welcome to PolyLend</h2>
          <p>Connect your wallet to get started</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      )}
    </div>
  );
}

export default App;