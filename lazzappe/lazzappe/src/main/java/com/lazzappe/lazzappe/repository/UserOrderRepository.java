package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserOrderRepository extends JpaRepository<User, Long> {
    Optional<User> findByID(String userorder_id);
}
