package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    User findByUsername(String username);
    User findByEmail(String email);
}
