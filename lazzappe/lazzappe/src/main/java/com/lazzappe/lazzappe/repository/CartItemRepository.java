package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cart_id = :cartId")
    List<CartItem> findByCartId(@Param("cartId") Long cartId);
}
