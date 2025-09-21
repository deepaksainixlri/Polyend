import React, { useState } from 'react';

const Borrow = () => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');

  const handleBorrow = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Integration with smart contracts will go here
      console.log(`Borrowing ${amount} ${selectedToken}`);
      alert(`Successfully borrowed ${amount} ${selectedToken}`);
      setAmount('');
    } catch (error) {
      console.error('Borrow error:', error);
      alert('Failed to borrow tokens');
    }
  };

  return (
    <div className="borrow">
      <h2>Borrow Assets</h2>
      <div className="borrow-form">
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
            placeholder="Enter amount to borrow"
            min="0"
            step="0.01"
          />
        </div>

        <div className="borrow-info">
          <p>Borrow APY: 4.2%</p>
          <p>Available to Borrow: 500 {selectedToken}</p>
          <p>Health Factor: 2.5</p>
        </div>

        <button className="borrow-button" onClick={handleBorrow}>
          Borrow {selectedToken}
        </button>
      </div>
    </div>
  );
};

export default Borrow;