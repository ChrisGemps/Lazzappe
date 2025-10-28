package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cartitem")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartitem_id;


    // Constructors
    public CartItem() {}

    // Getters and Setters
    public Long getCartItem_id() { return cartitem_id; }
    public void setCartItem_id(Long cartitem_id) { this.cartitem_id = cartitem_id; }

}
