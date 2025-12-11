import React, { useState } from 'react';
import '../css/Dashboard/TopUpPage.css';
import { useNavigate } from 'react-router-dom';

export default function TopUpPage(){
  const navigate = useNavigate();
  const options = [
    { label: '₱100', value: 100, discount: 0 },
    { label: '₱500', value: 500, discount: 0.03 },
    { label: '₱1,000', value: 1000, discount: 0.05 },
    { label: '₱3,000', value: 3000, discount: 0.07 },
    { label: '₱5,000', value: 5000, discount: 0.10 }
  ];

  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const choose = (opt) => {
    setSelected(opt);
    setMessage('');
  };

  const startTopUp = async () => {
    if (!selected) return setMessage('Please choose a top-up amount');
    setProcessing(true);
    setMessage('Processing payment...');

    // Simulate online payment flow. Replace with real integration.
    await new Promise(r => setTimeout(r, 1200));

    const discounted = selected.value * (1 - (selected.discount || 0));

    // Persist wallet balance locally (demo): credit the ORIGINAL amount, user only pays the discounted amount.
    const prev = parseFloat(localStorage.getItem('lazzappee_wallet') || '0');
    const newBalance = prev + selected.value; // credit full original top-up value
    localStorage.setItem('lazzappee_wallet', newBalance.toFixed(2));

    setProcessing(false);
    setMessage(`Success! You paid ₱${discounted.toFixed(2)} and ₱${selected.value.toFixed(2)} was added to your Lazzappee wallet.`);

    // Dispatch a custom event so other pages can update balances
    try { window.dispatchEvent(new CustomEvent('lazzappe:wallet-updated', { detail: { balance: newBalance } })); } catch (e) {}

    // Optionally navigate to profile or dashboard after short delay
    setTimeout(()=>navigate('/profile'), 1400);
  };

  return (
    <div className="topup-root">
      <div className="topup-card">
        <h2>Top-up Lazzappee Wallet</h2>
        <p className="muted">Choose an amount to add to your wallet. Discounts applied automatically.</p>

        <div className="topup-options">
          {options.map((o) => (
            <button
              key={o.value}
              className={`topup-option ${selected && selected.value === o.value ? 'active' : ''}`}
              onClick={() => choose(o)}
            >
              <div className="topup-amount">{o.label}</div>
              <div className="topup-meta">{o.discount > 0 ? `${(o.discount*100).toFixed(0)}% OFF!` : 'No discount'}</div>
            </button>
          ))}
        </div>

        <div className="topup-summary">
          <div>
            <span>Selected:</span>
            <strong>{selected ? `₱${selected.value.toFixed(2)}` : '—'}</strong>
          </div>
          <div>
            <span>You pay:</span>
            <strong>{selected ? `₱${(selected.value * (1 - (selected.discount||0))).toFixed(2)}` : '—'}</strong>
          </div>
          <div>
            <span>Credit to wallet:</span>
            <strong>{selected ? `₱${selected.value.toFixed(2)}` : '—'}</strong>
          </div>
        </div>

        {message && <div className="topup-message">{message}</div>}

        <div className="topup-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn-primary" onClick={startTopUp} disabled={processing}>{processing ? 'Processing...' : 'Pay Online'}</button>
        </div>
      </div>
    </div>
  );
}
