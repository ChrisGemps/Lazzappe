package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.CartItem;
import com.lazzappe.lazzappe.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
}
