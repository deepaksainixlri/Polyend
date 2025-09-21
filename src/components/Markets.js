import React, { useState } from 'react';

function Markets({ onSupply, onBorrow, onRepay, onWithdraw, balances, marketData }) {
  const [amounts, setAmounts] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const markets = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'USDC',
      color: '#2775ca'
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: 'DAI',
      color: '#f4b731'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      icon: 'ETH',
      color: '#627eea'
    }
  ];

  const handleAction = async (action, asset) => {
    const amount = amounts[`${asset}-${action}`] || '0';
    const actionKey = `${asset}-${action}`;

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [actionKey]: true }));

    try {
      switch(action) {
        case 'supply':
          await onSupply(asset, amount);
          break;
        case 'borrow':
          await onBorrow(asset, amount);
          break;
        case 'repay':
          await onRepay(asset, amount);
          break;
        case 'withdraw':
          await onWithdraw(asset, amount);
          break;
        default:
          break;
      }

      // Clear the input after successful action
      setAmounts(prev => ({ ...prev, [`${asset}-${action}`]: '' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const formatRate = (rate) => {
    const percentage = (parseFloat(rate || 0) * 100);
    return percentage.toFixed(2);
  };

  const formatBalance = (balance) => {
    const value = parseFloat(balance || 0);
    if (value === 0) return '0.00';
    if (value < 0.01) return '<0.01';
    return value.toFixed(4);
  };

  const formatLiquidity = (liquidity) => {
    const value = parseFloat(liquidity || 0);
    if (value === 0) return '0.00';
    if (value < 0.01) return '<0.01';
    if (value > 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value > 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const isLowLiquidity = (liquidity) => {
    return parseFloat(liquidity || 0) < 1000;
  };

  const LoadingSpinner = () => (
    <div className="loading">
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="markets">
      <h2>Markets</h2>

      <table className="markets-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Supply APY</th>
            <th>Borrow APY</th>
            <th>Available Liquidity</th>
            <th>Your Supply</th>
            <th>Your Borrow</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {markets.map((market, index) => (
            <tr key={market.symbol} style={{ animationDelay: `${index * 0.1}s` }}>
              <td>
                <div className="asset-info">
                  <div className="asset-icon">
                    {market.icon}
                  </div>
                  <div className="asset-details">
                    <span className="symbol">{market.symbol}</span>
                    <span className="name">{market.name}</span>
                  </div>
                </div>
              </td>

              <td>
                {marketData[market.symbol] ? (
                  <span className="rate-display supply-rate">
                    {formatRate(marketData[market.symbol].supplyRate)}%
                  </span>
                ) : (
                  <LoadingSpinner />
                )}
              </td>

              <td>
                {marketData[market.symbol] ? (
                  <span className="rate-display borrow-rate">
                    {formatRate(marketData[market.symbol].borrowRate)}%
                  </span>
                ) : (
                  <LoadingSpinner />
                )}
              </td>

              <td>
                {marketData[market.symbol] ? (
                  <span
                    className={`liquidity-display ${isLowLiquidity(marketData[market.symbol].availableLiquidity) ? 'low-liquidity' : ''}`}
                  >
                    {formatLiquidity(marketData[market.symbol].availableLiquidity)} {market.symbol}
                  </span>
                ) : (
                  <LoadingSpinner />
                )}
              </td>

              <td>
                <span className="balance-display">
                  {formatBalance(balances[market.symbol]?.supply)}
                </span>
              </td>

              <td>
                <span className="balance-display">
                  {formatBalance(balances[market.symbol]?.borrow)}
                </span>
              </td>

              <td>
                <div className="action-group">
                  {/* Supply/Withdraw Row */}
                  <div className="action-row">
                    <input
                      id={`supply-${market.symbol.toLowerCase()}`}
                      name={`supply-${market.symbol.toLowerCase()}`}
                      className="action-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Supply ${market.symbol}`}
                      value={amounts[`${market.symbol}-supply`] || ''}
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-supply`]: e.target.value
                      })}
                      aria-label={`Supply ${market.symbol} amount`}
                    />
                    <button
                      className="action-btn btn-supply"
                      onClick={() => handleAction('supply', market.symbol)}
                      disabled={loadingStates[`${market.symbol}-supply`]}
                      aria-label={`Supply ${market.symbol} to earn interest`}
                      type="button"
                    >
                      {loadingStates[`${market.symbol}-supply`] ? <LoadingSpinner /> : 'Supply'}
                    </button>

                    <input
                      id={`withdraw-${market.symbol.toLowerCase()}`}
                      name={`withdraw-${market.symbol.toLowerCase()}`}
                      className="action-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Withdraw ${market.symbol}`}
                      value={amounts[`${market.symbol}-withdraw`] || ''}
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-withdraw`]: e.target.value
                      })}
                      aria-label={`Withdraw ${market.symbol} amount`}
                    />
                    <button
                      className="action-btn btn-withdraw"
                      onClick={() => handleAction('withdraw', market.symbol)}
                      disabled={loadingStates[`${market.symbol}-withdraw`]}
                      aria-label={`Withdraw ${market.symbol} from your supply`}
                      type="button"
                    >
                      {loadingStates[`${market.symbol}-withdraw`] ? <LoadingSpinner /> : 'Withdraw'}
                    </button>
                  </div>

                  {/* Borrow/Repay Row */}
                  <div className="action-row">
                    <input
                      id={`borrow-${market.symbol.toLowerCase()}`}
                      name={`borrow-${market.symbol.toLowerCase()}`}
                      className="action-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Borrow ${market.symbol}`}
                      value={amounts[`${market.symbol}-borrow`] || ''}
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-borrow`]: e.target.value
                      })}
                      aria-label={`Borrow ${market.symbol} amount`}
                    />
                    <button
                      className="action-btn btn-borrow"
                      onClick={() => handleAction('borrow', market.symbol)}
                      disabled={loadingStates[`${market.symbol}-borrow`]}
                      aria-label={`Borrow ${market.symbol} against your collateral`}
                      type="button"
                    >
                      {loadingStates[`${market.symbol}-borrow`] ? <LoadingSpinner /> : 'Borrow'}
                    </button>

                    <input
                      id={`repay-${market.symbol.toLowerCase()}`}
                      name={`repay-${market.symbol.toLowerCase()}`}
                      className="action-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Repay ${market.symbol}`}
                      value={amounts[`${market.symbol}-repay`] || ''}
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-repay`]: e.target.value
                      })}
                      aria-label={`Repay ${market.symbol} amount`}
                    />
                    <button
                      className="action-btn btn-repay"
                      onClick={() => handleAction('repay', market.symbol)}
                      disabled={loadingStates[`${market.symbol}-repay`]}
                      aria-label={`Repay ${market.symbol} loan`}
                      type="button"
                    >
                      {loadingStates[`${market.symbol}-repay`] ? <LoadingSpinner /> : 'Repay'}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Market Summary */}
      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-lg)',
        background: 'var(--background-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          <span>💡</span>
          Market Insights
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
          fontSize: '14px'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Best Supply Rate:</strong>{' '}
            <span style={{ color: 'var(--success-green)' }}>
              {marketData.USDC ? `${formatRate(Math.max(
                parseFloat(marketData.USDC?.supplyRate || 0),
                parseFloat(marketData.DAI?.supplyRate || 0),
                parseFloat(marketData.WETH?.supplyRate || 0)
              ))}%` : 'Loading...'}
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Total Available:</strong>{' '}
            <span style={{ color: 'var(--paypal-blue)' }}>
              {marketData.USDC ? `$${formatLiquidity(
                (parseFloat(marketData.USDC?.availableLiquidity || 0) +
                 parseFloat(marketData.DAI?.availableLiquidity || 0) +
                 parseFloat(marketData.WETH?.availableLiquidity || 0) * 2000).toFixed(0)
              )}` : 'Loading...'}
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Protocol Status:</strong>{' '}
            <span style={{ color: 'var(--success-green)' }}>🟢 Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Markets;