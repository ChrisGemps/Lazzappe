package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
	// Find seller by the associated user entity's primary key (user_id)
	// This checks the foreign key directly, so it works even if user reference is null in Java
	@Query("SELECT s FROM Seller s WHERE s.user.user_id = :userId OR s.user IS NULL AND (SELECT COUNT(s2) FROM Seller s2 WHERE s2.user.user_id = :userId) = 0")
	Seller findByUserId(@Param("userId") Long userId);
	
	// Find seller by user_id checking the foreign key directly
	// This is more reliable for finding sellers that might be disconnected from user reference
	@Query(value = "SELECT * FROM seller WHERE user_id = :userId LIMIT 1", nativeQuery = true)
	Seller findByUserIdNative(@Param("userId") Long userId);

}
