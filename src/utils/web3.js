import { ethers } from 'ethers';
import { CONTRACTS, NETWORK_CONFIG, ABIS } from '../contracts/config';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  // Connect to wallet
  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create provider and signer
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();

        // Initialize contracts
        await this.initializeContracts();

        this.isConnected = true;
        return await this.signer.getAddress();
      } else {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Initialize contract instances
  async initializeContracts() {
    try {
      this.contracts.lendingPool = new ethers.Contract(
        CONTRACTS.LENDING_POOL,
        ABIS.LENDING_POOL,
        this.signer
      );

      // Initialize token contracts
      Object.keys(CONTRACTS.TOKENS).forEach(token => {
        this.contracts[token.toLowerCase()] = new ethers.Contract(
          CONTRACTS.TOKENS[token],
          ABIS.ERC20,
          this.signer
        );
      });

      // Initialize pool token contracts
      Object.keys(CONTRACTS.POOL_TOKENS).forEach(token => {
        this.contracts[token.toLowerCase()] = new ethers.Contract(
          CONTRACTS.POOL_TOKENS[token],
          ABIS.POOL_TOKEN,
          this.signer
        );
      });

      this.contracts.priceOracle = new ethers.Contract(
        CONTRACTS.PRICE_ORACLE,
        ABIS.PRICE_ORACLE,
        this.signer
      );
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  // Get user's token balance
  async getTokenBalance(tokenAddress, userAddress) {
    try {
      const contract = new ethers.Contract(tokenAddress, ABIS.ERC20, this.provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }

  // Supply tokens to the lending pool
  async supply(tokenAddress, amount) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ABIS.ERC20, this.signer);
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);

      // Approve token spending
      const approveTx = await tokenContract.approve(CONTRACTS.LENDING_POOL, amountWei);
      await approveTx.wait();

      // Supply to lending pool
      const supplyTx = await this.contracts.lendingPool.supply(
        tokenAddress,
        amountWei,
        await this.signer.getAddress(),
        0
      );
      return await supplyTx.wait();
    } catch (error) {
      console.error('Failed to supply tokens:', error);
      throw error;
    }
  }

  // Borrow tokens from the lending pool
  async borrow(tokenAddress, amount) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ABIS.ERC20, this.signer);
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);

      const borrowTx = await this.contracts.lendingPool.borrow(
        tokenAddress,
        amountWei,
        2, // Variable rate mode
        0,
        await this.signer.getAddress()
      );
      return await borrowTx.wait();
    } catch (error) {
      console.error('Failed to borrow tokens:', error);
      throw error;
    }
  }

  // Get user account data
  async getUserAccountData(userAddress) {
    try {
      const accountData = await this.contracts.lendingPool.getUserAccountData(userAddress);
      return {
        totalCollateralETH: ethers.utils.formatEther(accountData.totalCollateralETH),
        totalDebtETH: ethers.utils.formatEther(accountData.totalDebtETH),
        availableBorrowsETH: ethers.utils.formatEther(accountData.availableBorrowsETH),
        currentLiquidationThreshold: accountData.currentLiquidationThreshold.toString(),
        ltv: accountData.ltv.toString(),
        healthFactor: ethers.utils.formatEther(accountData.healthFactor)
      };
    } catch (error) {
      console.error('Failed to get user account data:', error);
      throw error;
    }
  }

  // Switch to correct network
  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }
}

export default new Web3Service();