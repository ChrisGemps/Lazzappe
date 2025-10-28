package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cart_id;

    // Foreign key relationship to Customer
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Constructors
    public Cart() {}
    public Cart(Customer customer) {
        this.customer = customer;
    }

    // Getters and Setters
    public Long getCart_id() { return cart_id; }
    public void setCart_id(Long cart_id) { this.cart_id = cart_id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
