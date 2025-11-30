package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {

    // Find a seller by its associated user
    Optional<Seller> findByUser(User user);

    // Optional helper methods
    Optional<Seller> findByUser_Username(String username);
    Optional<Seller> findByUser_Email(String email);
    // alternative method names (no underscore) to support different naming styles
    Optional<Seller> findByUserUsername(String username);
    Optional<Seller> findByUserEmail(String email);
}
