import React from 'react';

function Header({ account, connectWallet, healthFactor }) {
  return (
    <header className="header">
      <div className="logo">
        <h1>🏦 PolyLend</h1>
        <span>Advanced DeFi Lending Protocol</span>
      </div>
      
      <div className="header-info">
        {account && (
          <div className="health-factor">
            Health Factor: {parseFloat(healthFactor).toFixed(2)}
            <span className={healthFactor >= 1 ? 'safe' : 'danger'}>
              {healthFactor >= 1 ? ' ✅' : ' ⚠️'}
            </span>
          </div>
        )}
        
        <button 
          className="connect-btn" 
          onClick={connectWallet}
        >
          {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
}

export default Header;