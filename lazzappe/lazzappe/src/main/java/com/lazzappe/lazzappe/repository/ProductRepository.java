package com.lazzappe.lazzappe.repository;
import java.util.List;
import com.lazzappe.lazzappe.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
    
    @Query("SELECT p FROM Product p WHERE p.seller.seller_id = :sellerId")
    List<Product> findBySellerSellerId(@Param("sellerId") Long sellerId);

    // FIX 2 : Search by product name (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // FIX 3 : Find by category
    List<Product> findByCategory(String category);
}
