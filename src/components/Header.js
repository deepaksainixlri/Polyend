import React from 'react';

function Header({ account, connectWallet, healthFactor }) {
  const formatHealthFactor = (factor) => {
    const value = parseFloat(factor);
    if (value === 0) return '∞';
    return value.toFixed(2);
  };

  const getHealthStatus = (factor) => {
    const value = parseFloat(factor);
    if (value >= 2) return 'safe';
    if (value >= 1.2) return 'safe';
    return 'danger';
  };

  const getHealthIcon = (factor) => {
    const value = parseFloat(factor);
    if (value >= 2) return '🟢';
    if (value >= 1.2) return '🟡';
    return '🔴';
  };

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          💎
        </div>
        <div>
          <h1>PolyLend</h1>
          <span>Professional DeFi Lending</span>
        </div>
      </div>

      <div className="header-info">
        {account && (
          <div className="health-factor">
            <span>Health Factor:</span>
            <strong>{formatHealthFactor(healthFactor)}</strong>
            <span className={getHealthStatus(healthFactor)}>
              {getHealthIcon(healthFactor)}
            </span>
          </div>
        )}

        <button
          className="connect-btn"
          onClick={connectWallet}
          type="button"
          aria-label={account ? "Connected wallet address" : "Connect MetaMask wallet"}
        >
          {account ? (
            <>
              <span style={{ marginRight: '8px' }}>🔗</span>
              {`${account.slice(0,6)}...${account.slice(-4)}`}
            </>
          ) : (
            <>
              <span style={{ marginRight: '8px' }}>👛</span>
              Connect Wallet
            </>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;