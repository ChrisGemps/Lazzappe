package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    User findByUsername(String username);
    User findByEmail(String email);
    
    // Native update to disconnect seller without triggering cascade issues
    @Modifying
    @Query(value = "UPDATE user SET seller_id = NULL WHERE user_id = :userId", nativeQuery = true)
    void disconnectSeller(@Param("userId") Long userId);
}
