import React from 'react';

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

  const handleAdd = async () => {
    try {
      const res = await onAdd?.(product);
      return res !== false;
    } catch (err) {
      console.error('Add action failed:', err);
      return false;
    }
  };

  const canAdd = (() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return true;
    try {
      const user = JSON.parse(userStr);
      const role = user?.role || '';
      if (role === 'SELLER') return false;
      const currUserId = user?.id || user?.user_id || user?.userId;
      const sellerUserId = product?.raw?.seller_user_id || product?.raw?.seller?.user?.user_id || product?.raw?.seller?.user?.id || product?.raw?.seller?.user?.userId || product?.raw?.seller?.userId || null;
      if (currUserId && sellerUserId && Number(currUserId) === Number(sellerUserId)) return false;
      return true;
    } catch (err) { return true; }
  })();

  const handleBuy = async () => {
    try {
      const ok = await handleAdd();
      if (ok) onClose();
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
          <img src={product.image} alt={product.name} className="product-modal-image" style={{width:240, height:240, objectFit:'cover', borderRadius:8}} />
          <div style={{flex:1}}>
            <h2 style={{marginTop:0}}>{product.name}</h2>
            <p style={{color:'#666'}}>{product.description || 'No description available.'}</p>
            <div style={{fontWeight:700, marginTop:8}}>₱{product.price?.toFixed(2) ?? '0.00'}</div>
            <div style={{marginTop:12, display:'flex', gap:8}}>
              <button className="btn btn-secondary" onClick={handleAdd} disabled={!canAdd} title={!canAdd ? 'You cannot add this product to your cart' : 'Add to cart'}>Add to cart</button>
              <button className="btn btn-primary" onClick={handleBuy}>Buy now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
