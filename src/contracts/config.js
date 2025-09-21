// Contract addresses from Remix deployment
export const CONTRACTS = {
  PolyLend: "0xf386c02dAe719a36BEFbC6bB02dd2f3C8D7B93b6", // Your deployed PolyLend address
  USDC: "0x22Fe4496E1ED9e4f03D3991c6040501f24add7Fd",     // Your deployed USDC address
  DAI: "0xdc06d38A7560e76D2766cD85C0192260f778BA0A",      // Your deployed DAI address
  WETH: "0xfC7D7c7424Db3F94E7E28b905dCE2DCaeb0cFb90",     // Your deployed WETH address
  InterestModel: "0x31Aa57ADd84978b490DAc7ad6721cBDe40B50884",
  PriceOracle: "0xFA1E907eafA5B5490ba0Deb416118993b8c89752"
};

// Contract ABIs (copy from Remix)
export const POLYLEND_ABI = [
  "function supply(address asset, uint256 amount) external",
  "function withdraw(address asset, uint256 amount) external",
  "function borrow(address asset, uint256 amount) external",
  "function repay(address asset, uint256 amount) external",
  "function getUserSupply(address user, address asset) external view returns (uint256)",
  "function getUserBorrow(address user, address asset) external view returns (uint256)",
  "function getHealthFactor(address user) external view returns (uint256)",
  "function getMarketData(address asset) external view returns (uint256,uint256,uint256,uint256,uint256)",
  "event Supply(address indexed user, address indexed asset, uint256 amount)",
  "event Borrow(address indexed user, address indexed asset, uint256 amount)"
];

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)"
];