package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long order_id;
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Column(nullable = false)
    private LocalDateTime order_date;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total_amount;
    
    @Column(nullable = false)
    private String status; // "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
    
    private String shipping_address;
    
    private String payment_method;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    // Constructors
    public Order() {
        this.order_date = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    public Order(Customer customer, BigDecimal total_amount, String shipping_address, String payment_method) {
        this.customer = customer;
        this.total_amount = total_amount;
        this.shipping_address = shipping_address;
        this.payment_method = payment_method;
        this.order_date = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    // Getters and Setters
    public Long getOrder_id() { return order_id; }
    public void setOrder_id(Long order_id) { this.order_id = order_id; }
    
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    
    public LocalDateTime getOrder_date() { return order_date; }
    public void setOrder_date(LocalDateTime order_date) { this.order_date = order_date; }
    
    public BigDecimal getTotal_amount() { return total_amount; }
    public void setTotal_amount(BigDecimal total_amount) { this.total_amount = total_amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getShipping_address() { return shipping_address; }
    public void setShipping_address(String shipping_address) { this.shipping_address = shipping_address; }
    
    public String getPayment_method() { return payment_method; }
    public void setPayment_method(String payment_method) { this.payment_method = payment_method; }
    
    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}