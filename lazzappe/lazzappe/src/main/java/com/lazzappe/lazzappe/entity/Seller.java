package com.lazzappe.lazzappe.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "seller")
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seller_id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    // Constructors
    public Seller() {}

    public Seller(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    // Getters and Setters
    public Long getId() { return seller_id; }
    public void setId(Long seller_id) { this.seller_id = seller_id; }

    public String getFirstname() { return firstname; }
    public void setUsername(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setPassword(String lastname) { this.lastname = lastname; }

}
