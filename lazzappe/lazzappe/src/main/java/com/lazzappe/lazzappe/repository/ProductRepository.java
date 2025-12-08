package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySeller(Seller seller);
    List<Product> findBySeller_Id(Long sellerId);
    void deleteBySeller(Seller seller);
    void deleteBySeller_Id(Long sellerId);
}
