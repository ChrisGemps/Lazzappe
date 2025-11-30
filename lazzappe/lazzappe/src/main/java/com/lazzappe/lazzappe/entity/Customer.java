package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "customer")
public class Customer {

            @Id
            @GeneratedValue(strategy = GenerationType.IDENTITY)
            private Long customer_id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String shipping_address;
    private String billing_address;

    // Getters and Setters
    public Long getCustomer_id() { return customer_id; }
    public void setCustomer_id(Long customer_id) { this.customer_id = customer_id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getShipping_address() { return shipping_address; }
    public void setShipping_address(String shipping_address) { this.shipping_address = shipping_address; }
    public String getBilling_address() { return billing_address; }
    public void setBilling_address(String billing_address) { this.billing_address = billing_address; }
}
