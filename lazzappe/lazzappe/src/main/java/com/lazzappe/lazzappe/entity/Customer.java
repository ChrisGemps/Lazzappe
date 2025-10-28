package com.lazzappe.lazzappe.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customer_id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    // Constructors
    public Customer() {}

    public Customer(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    // Getters and Setters
    public Long getId() { return customer_id; }
    public void setId(Long customer_id) { this.customer_id = customer_id; }

    public String getFirstname() { return firstname; }
    public void setUsername(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setPassword(String lastname) { this.lastname = lastname; }

}
