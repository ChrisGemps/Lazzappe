package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // Remove custom findById - it's already provided by JpaRepository
}