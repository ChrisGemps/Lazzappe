package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirstname(String firstname);
    Optional<User> findByLastname(String lastname);
}
