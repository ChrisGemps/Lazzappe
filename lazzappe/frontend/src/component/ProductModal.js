import React from 'react';

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

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
              <button className="btn btn-secondary" onClick={() => onAdd(product)}>Add to cart</button>
              <button className="btn btn-primary" onClick={() => { onAdd(product); onClose(); }}>Buy now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
