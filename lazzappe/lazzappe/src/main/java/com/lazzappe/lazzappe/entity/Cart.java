package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart")
public class Cart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cart_id;
    
    @OneToOne
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;
    
    private LocalDateTime created_at;
    
    private LocalDateTime updated_at;
    
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();
    
    // Constructors
    public Cart() {
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }
    
    public Cart(Customer customer) {
        this.customer = customer;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getCart_id() { return cart_id; }
    public void setCart_id(Long cart_id) { this.cart_id = cart_id; }
    
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    
    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }
    
    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }
    
    public List<CartItem> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }
}