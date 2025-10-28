package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "orderitem")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderitem_id;


    // Constructors
    public OrderItem() {}

    // Getters and Setters
    public Long getOrderItem_id() { return orderitem_id; }
    public void setOrderItem_id(Long orderitem_id) { this.orderitem_id = orderitem_id; }

}
