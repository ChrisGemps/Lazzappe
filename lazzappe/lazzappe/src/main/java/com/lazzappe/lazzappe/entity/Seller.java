package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "seller")
public class Seller {

            @Id
            @GeneratedValue(strategy = GenerationType.IDENTITY)
            private Long seller_id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String store_name;
    private String store_description;
    private String business_license;

    // Getters and Setters
    public Long getSeller_id() { return seller_id; }
    public void setSeller_id(Long seller_id) { this.seller_id = seller_id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getStore_name() { return store_name; }
    public void setStore_name(String store_name) { this.store_name = store_name; }
    public String getStore_description() { return store_description; }
    public void setStore_description(String store_description) { this.store_description = store_description; }
    public String getBusiness_license() { return business_license; }
    public void setBusiness_license(String business_license) { this.business_license = business_license; }
}
