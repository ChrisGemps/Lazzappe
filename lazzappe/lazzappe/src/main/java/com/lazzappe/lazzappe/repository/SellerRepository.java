package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
	// Find seller by the associated user entity's primary key (user_id)
	@Query("SELECT s FROM Seller s WHERE s.user.user_id = :userId")
	Seller findByUserId(@Param("userId") Long userId);

}
