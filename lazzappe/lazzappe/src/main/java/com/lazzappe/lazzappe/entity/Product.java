package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long product_id;


    // Constructors
    public Product() {}

    // Getters and Setters
    public Long getCart_id() { return product_id; }
    public void setCart_id(Long product_id) { this.product_id = product_id; }

}
