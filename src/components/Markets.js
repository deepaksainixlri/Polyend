import React, { useState } from 'react';

function Markets({ onSupply, onBorrow, onRepay, onWithdraw, balances, marketData }) {
  const [amounts, setAmounts] = useState({});
  
  const markets = [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'DAI', name: 'Dai Stablecoin' },
    { symbol: 'WETH', name: 'Wrapped Ether' }
  ];

  const handleAction = (action, asset) => {
    const amount = amounts[`${asset}-${action}`] || '0';
    
    switch(action) {
      case 'supply':
        onSupply(asset, amount);
        break;
      case 'borrow':
        onBorrow(asset, amount);
        break;
      case 'repay':
        onRepay(asset, amount);
        break;
      case 'withdraw':
        onWithdraw(asset, amount);
        break;
      default:
        break;
    }
  };

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
          {markets.map(market => (
            <tr key={market.symbol}>
              <td>
                <div className="asset-info">
                  <span className="symbol">{market.symbol}</span>
                  <span className="name">{market.name}</span>
                </div>
              </td>
              
              <td>
                {marketData[market.symbol]
                  ? `${(parseFloat(marketData[market.symbol].supplyRate) * 100).toFixed(2)}%`
                  : 'Loading...'
                }
              </td>

              <td>
                {marketData[market.symbol]
                  ? `${(parseFloat(marketData[market.symbol].borrowRate) * 100).toFixed(2)}%`
                  : 'Loading...'
                }
              </td>

              <td>
                <span className={parseFloat(marketData[market.symbol]?.availableLiquidity || '0') < 0.01 ? 'low-liquidity' : ''}>
                  {marketData[market.symbol]
                    ? `${parseFloat(marketData[market.symbol].availableLiquidity).toFixed(4)} ${market.symbol}`
                    : 'Loading...'
                  }
                </span>
              </td>

              <td>{balances[market.symbol]?.supply || '0.00'}</td>

              <td>{balances[market.symbol]?.borrow || '0.00'}</td>
              
              <td>
                <div className="action-group">
                  <div className="supply-withdraw-group">
                    <input
                      type="number"
                      placeholder="Supply Amount"
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-supply`]: e.target.value
                      })}
                    />
                    <button
                      className="btn-supply"
                      onClick={() => handleAction('supply', market.symbol)}
                    >
                      Supply
                    </button>

                    <input
                      type="number"
                      placeholder="Withdraw Amount"
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-withdraw`]: e.target.value
                      })}
                    />
                    <button
                      className="btn-withdraw"
                      onClick={() => handleAction('withdraw', market.symbol)}
                    >
                      Withdraw
                    </button>
                  </div>

                  <div className="borrow-repay-group">
                    <input
                      type="number"
                      placeholder="Borrow Amount"
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-borrow`]: e.target.value
                      })}
                    />
                    <button
                      className="btn-borrow"
                      onClick={() => handleAction('borrow', market.symbol)}
                    >
                      Borrow
                    </button>

                    <input
                      type="number"
                      placeholder="Repay Amount"
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [`${market.symbol}-repay`]: e.target.value
                      })}
                    />
                    <button
                      className="btn-repay"
                      onClick={() => handleAction('repay', market.symbol)}
                    >
                      Repay
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Markets;