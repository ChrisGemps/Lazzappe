package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer")
@PrimaryKeyJoinColumn(name = "user_id")
public class Customer extends User {
    
    private String shipping_address;
    
    private String billing_address;
    
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
    
    public Customer() {
        super();
    }
    
    public Customer(String username, String email, String password, String phone_number, 
                    String shipping_address, String billing_address) {
        super(username, email, password, phone_number, "CUSTOMER");
        this.shipping_address = shipping_address;
        this.billing_address = billing_address;
    }
    
    public String getShipping_address() { return shipping_address; }
    public void setShipping_address(String shipping_address) { this.shipping_address = shipping_address; }
    
    public String getBilling_address() { return billing_address; }
    public void setBilling_address(String billing_address) { this.billing_address = billing_address; }
    
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
}