import React from 'react';

function Dashboard({ balances }) {
  const calculateTotal = (type) => {
    let total = 0;
    Object.values(balances).forEach(balance => {
      total += parseFloat(balance[type] || 0);
    });
    return total;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalSupplied = calculateTotal('supply');
  const totalBorrowed = calculateTotal('borrow');
  const netWorth = totalSupplied - totalBorrowed;
  const availableToBorrow = Math.max(0, totalSupplied * 0.75 - totalBorrowed);
  const utilizationRate = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0;

  const getUtilizationColor = (rate) => {
    if (rate < 50) return 'var(--success-green)';
    if (rate < 75) return 'var(--warning-orange)';
    return 'var(--error-red)';
  };

  const stats = [
    {
      title: 'Total Supplied',
      value: formatCurrency(totalSupplied),
      icon: '💰',
      trend: totalSupplied > 0 ? '+0.00%' : '0.00%',
      trendPositive: true
    },
    {
      title: 'Total Borrowed',
      value: formatCurrency(totalBorrowed),
      icon: '📊',
      trend: totalBorrowed > 0 ? `${utilizationRate.toFixed(1)}% utilized` : '0.0% utilized',
      trendPositive: utilizationRate < 75
    },
    {
      title: 'Net Worth',
      value: formatCurrency(netWorth),
      icon: '💎',
      trend: netWorth >= 0 ? 'Positive' : 'Negative',
      trendPositive: netWorth >= 0
    },
    {
      title: 'Available to Borrow',
      value: formatCurrency(availableToBorrow),
      icon: '🔓',
      trend: availableToBorrow > 0 ? 'Ready to use' : 'Increase collateral',
      trendPositive: availableToBorrow > 0
    }
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={stat.title} className="stat-card" style={{animationDelay: `${index * 0.1}s`}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
              <h3>{stat.title}</h3>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div
              className="stat-trend"
              style={{
                color: stat.trendPositive ? 'var(--success-green)' : 'var(--warning-orange)'
              }}
            >
              <span>{stat.trendPositive ? '↗' : '↘'}</span>
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Health Indicator */}
      {totalSupplied > 0 && (
        <div className="stat-card" style={{
          marginTop: 'var(--space-lg)',
          background: 'linear-gradient(135deg, var(--background-light), var(--white))',
          border: '2px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>📈</span>
            <h3>Portfolio Health</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Utilization Rate
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: getUtilizationColor(utilizationRate)
              }}>
                {utilizationRate.toFixed(1)}%
              </div>
            </div>
            <div style={{ width: '200px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-light)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(utilizationRate, 100)}%`,
                  height: '100%',
                  backgroundColor: getUtilizationColor(utilizationRate),
                  transition: 'all 0.6s ease',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                textAlign: 'center'
              }}>
                {utilizationRate < 50 ? 'Conservative' : utilizationRate < 75 ? 'Moderate' : 'Aggressive'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;