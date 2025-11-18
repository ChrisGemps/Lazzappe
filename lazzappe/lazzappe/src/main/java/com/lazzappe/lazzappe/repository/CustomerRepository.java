package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByFirstname(String firstname);
    Optional<Customer> findByLastname(String lastname);
}