# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PolyLend is a decentralized lending protocol frontend built with React. It allows users to supply assets to earn yield and borrow against their collateral. The application integrates with Ethereum smart contracts using ethers.js.

## Development Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Architecture

### Frontend Structure
- **App.js**: Main application component handling wallet connection, contract initialization, and core lending operations (supply, borrow, withdraw, repay)
- **components/Header.js**: Navigation and wallet connection status
- **components/Dashboard.js**: User portfolio overview with total supplied/borrowed amounts and health metrics
- **components/Markets.js**: Market table for asset interactions and APY display
- **contracts/config.js**: Contract addresses and ABIs for deployed smart contracts

### Smart Contract Integration
The app interacts with several deployed contracts:
- **PolyLend**: Main lending protocol contract
- **USDC, DAI, WETH**: ERC-20 token contracts for supported assets
- **InterestModel & PriceOracle**: Supporting infrastructure contracts

### Core Functionality
- **Wallet Connection**: MetaMask integration via ethers.js Web3Provider
- **Asset Operations**: Supply, withdraw, borrow, and repay functions with approval flow
- **User Data Loading**: Real-time balance and health factor tracking
- **Transaction Management**: Toast notifications for transaction status

### Key Dependencies
- **ethers.js v5.7.2**: Ethereum interaction library
- **react-toastify**: User notifications
- **recharts**: Data visualization (installed but not currently used)

## Contract Configuration

Contract addresses are hardcoded in `src/contracts/config.js` and appear to be from a testnet deployment. When working with contracts:
- All token amounts use 18 decimal precision
- Approval transactions are required before supply/repay operations
- Health factor calculation is handled by the smart contract