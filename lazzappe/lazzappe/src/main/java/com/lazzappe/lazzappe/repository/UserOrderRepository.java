package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.UserOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserOrderRepository extends JpaRepository<UserOrder, Long> {
    // Remove custom findById - it's already provided by JpaRepository
}