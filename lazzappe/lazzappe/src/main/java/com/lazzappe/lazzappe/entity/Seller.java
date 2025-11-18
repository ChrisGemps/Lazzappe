package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seller")
public class Seller extends User {
    
    private Long customer_id; // Based on your diagram
    
    private String store_name;
    
    @Column(length = 1000)
    private String store_description;
    
    private String business_license;
    
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products = new ArrayList<>();
    
    // Constructors
    public Seller() {}
    
    public Seller(String username, String email, String password, String phone_number, 
                  String store_name, String store_description, String business_license) {
        super(username, email, password, phone_number, "SELLER");
        this.store_name = store_name;
        this.store_description = store_description;
        this.business_license = business_license;
    }
    
    // Getters and Setters
    public Long getCustomer_id() { return customer_id; }
    public void setCustomer_id(Long customer_id) { this.customer_id = customer_id; }
    
    public String getStore_name() { return store_name; }
    public void setStore_name(String store_name) { this.store_name = store_name; }
    
    public String getStore_description() { return store_description; }
    public void setStore_description(String store_description) { this.store_description = store_description; }
    
    public String getBusiness_license() { return business_license; }
    public void setBusiness_license(String business_license) { this.business_license = business_license; }
    
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}