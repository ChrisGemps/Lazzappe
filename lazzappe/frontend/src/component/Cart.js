import React from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, itemCount, total, removeFromCart, updateQty, clearCart, open, setOpen } = useCart();

  if (!open) return null;

  return (
    <div className="cart-backdrop" onClick={() => setOpen(false)}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3 style={{margin:0}}>Your Cart ({itemCount})</h3>
          <div>
            <button className="btn btn-ghost" onClick={() => { clearCart(); setOpen(false); }}>Clear</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">Your cart is empty — try adding some products.</div>
        ) : (
          <div style={{maxHeight: '62vh', overflow: 'auto'}}>
            {items.map((it) => (
              <div key={it.id} className="cart-item-row">
                <img src={it.image} alt={it.name} className="cart-thumb" />
                <div style={{flex:1}}>
                  <div className="cart-item-name">{it.name}</div>
                  <div className="cart-item-meta">Price: ${it.price?.toFixed(2) ?? '0.00'}</div>
                  <div style={{marginTop:8, display:'flex', alignItems:'center', gap:8}} className="qty-controls">
                    <button onClick={() => updateQty(it.id, Math.max(1, (it.qty||1)-1))} className="btn">-</button>
                    <div style={{minWidth:28, textAlign:'center'}}>{it.qty}</div>
                    <button onClick={() => updateQty(it.id, (it.qty||1)+1)} className="btn">+</button>
                    <button onClick={() => removeFromCart(it.id)} className="btn btn-ghost">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div style={{fontWeight:700}}>Total: ${total.toFixed(2)}</div>
          <div>
            <button className="btn btn-secondary" style={{marginRight:8}} onClick={() => { clearCart(); setOpen(false); }}>Clear</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  const payload = { items, username: localStorage.getItem('username') || null };
                  await axios.post('http://localhost:8080/api/orders', payload);
                  alert('Order placed successfully (backend confirmed)');
                  clearCart();
                  setOpen(false);
                } catch (e) {
                  console.warn('Checkout error', e);
                  alert('Checkout not available: backend endpoint not implemented. This is a placeholder.');
                }
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
