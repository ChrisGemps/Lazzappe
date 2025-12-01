package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.lazzappe.lazzappe.entity.Customer;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByCustomer(Customer customer);
}