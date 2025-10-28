package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "userorder")
public class UserOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userorder_id;

    // Foreign key relationship to Customer

    // Constructors

    // Getters and Setters
    public Long getCart_id() { return userorder_id; }
}
