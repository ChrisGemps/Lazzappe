package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Cart;
import com.lazzappe.lazzappe.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByCustomer(Customer customer);
}
