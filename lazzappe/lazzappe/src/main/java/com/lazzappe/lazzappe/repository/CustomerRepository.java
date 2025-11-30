package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByUser_Username(String username);
    Optional<Customer> findByUser_Email(String email);
    // alternative method names (no underscore) to support different naming styles
    Optional<Customer> findByUserUsername(String username);
    Optional<Customer> findByUserEmail(String email);
}
