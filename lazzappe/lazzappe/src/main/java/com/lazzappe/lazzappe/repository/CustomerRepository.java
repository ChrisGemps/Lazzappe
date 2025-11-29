package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUsername(String username);
    Optional<Customer> findByEmail(String email);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO customer (user_id, shipping_address, billing_address) VALUES (:userId, :shippingAddress, :billingAddress)", nativeQuery = true)
    void insertCustomer(@Param("userId") Long userId, @Param("shippingAddress") String shippingAddress, @Param("billingAddress") String billingAddress);
}