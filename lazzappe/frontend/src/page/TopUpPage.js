import React, { useState } from 'react';
import '../css/Dashboard/TopUpPage.css';
import { useNavigate } from 'react-router-dom';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

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
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const uid = user?.user_id || user?.id || user?.userId;
      const key = uid ? `lazzappee_wallet_${uid}` : 'lazzappee_wallet';
      const prev = parseFloat(localStorage.getItem(key) || '0');
      const newBalance = prev + selected.value; // credit full original top-up value
      localStorage.setItem(key, newBalance.toFixed(2));

      setProcessing(false);
      const successMsg = `Success! You paid ₱${discounted.toFixed(2)} and ₱${selected.value.toFixed(2)} was added to your Lazzappee wallet.`;
      setMessage(successMsg);

      // Dispatch a custom event so other pages can update balances (include userId)
      try { window.dispatchEvent(new CustomEvent('lazzappe:wallet-updated', { detail: { balance: newBalance, userId: uid } })); } catch (e) {}

      // show confirmation toast with quick actions
      setConfirmData({ paid: discounted.toFixed(2), credited: selected.value.toFixed(2), newBalance: newBalance.toFixed(2) });
      setShowConfirm(true);
      // auto-hide after 4s
      setTimeout(() => setShowConfirm(false), 4000);

      // Optionally navigate to profile or dashboard after short delay
      setTimeout(()=>navigate('/profile'), 4000);
    } catch (err) {
      console.error('Top-up error:', err);
      setProcessing(false);
      setMessage('Failed to top up. Please try again.');
    }
  };

  return (
    <>
      <NavBarComponent />
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

        {showConfirm && confirmData && (
          <div className="topup-toast-wrapper">
            <div className="topup-toast">
              <div className="topup-toast-inner">
                <div className="topup-toast-icon">✓</div>
                <div>
                  <div className="topup-toast-title">Top-up Successful</div>
                  <div className="topup-toast-sub">You paid ₱{confirmData.paid} — ₱{confirmData.credited} added (Balance: ₱{confirmData.newBalance})</div>
                </div>
              </div>
              <div className="topup-toast-actions">
                <button onClick={() => setShowConfirm(false)} className="toast-btn-close">Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="topup-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn-primary" onClick={startTopUp} disabled={processing}>{processing ? 'Processing...' : 'Pay Online'}</button>
        </div>
        </div>
      </div>
    </>
  );
}
