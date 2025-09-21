import React, { useState } from 'react';

const Supply = () => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');

  const handleSupply = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Integration with smart contracts will go here
      console.log(`Supplying ${amount} ${selectedToken}`);
      alert(`Successfully supplied ${amount} ${selectedToken}`);
      setAmount('');
    } catch (error) {
      console.error('Supply error:', error);
      alert('Failed to supply tokens');
    }
  };

  return (
    <div className="supply">
      <h2>Supply Assets</h2>
      <div className="supply-form">
        <div className="token-selection">
          <label>Select Token:</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>

        <div className="amount-input">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to supply"
            min="0"
            step="0.01"
          />
        </div>

        <div className="supply-info">
          <p>Current APY: 2.5%</p>
          <p>Your Balance: 1,000 {selectedToken}</p>
        </div>

        <button className="supply-button" onClick={handleSupply}>
          Supply {selectedToken}
        </button>
      </div>
    </div>
  );
};

export default Supply;