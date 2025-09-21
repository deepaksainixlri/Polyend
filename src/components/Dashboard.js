import React from 'react';

function Dashboard({ balances }) {
  const calculateTotal = (type) => {
    let total = 0;
    Object.values(balances).forEach(balance => {
      total += parseFloat(balance[type] || 0);
    });
    return total.toFixed(2);
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Supplied</h3>
          <p className="stat-value">${calculateTotal('supply')}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Borrowed</h3>
          <p className="stat-value">${calculateTotal('borrow')}</p>
        </div>
        
        <div className="stat-card">
          <h3>Net Worth</h3>
          <p className="stat-value">
            ${(calculateTotal('supply') - calculateTotal('borrow')).toFixed(2)}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Available to Borrow</h3>
          <p className="stat-value">
            ${(calculateTotal('supply') * 0.75 - calculateTotal('borrow')).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;