package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUsername(String username);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO seller (user_id, store_name, store_description, business_license) VALUES (:userId, :storeName, :storeDescription, :businessLicense)", nativeQuery = true)
    void insertSeller(@Param("userId") Long userId, @Param("storeName") String storeName, @Param("storeDescription") String storeDescription, @Param("businessLicense") String businessLicense);
}