package com.lazzappe.lazzappe.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_item")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    // Constructors
    public CartItem() {}

    public CartItem(Cart cart, Product product, Integer quantity) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.calculateSubtotal();
    }

    // Helper method to calculate subtotal
    public void calculateSubtotal() {
        if (product != null && product.getPrice() != null && quantity != null) {
            this.subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        } else {
            this.subtotal = BigDecimal.ZERO;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) {
        this.product = product;
        this.calculateSubtotal();
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.calculateSubtotal();
    }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
