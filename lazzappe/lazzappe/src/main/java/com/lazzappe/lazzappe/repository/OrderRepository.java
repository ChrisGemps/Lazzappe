package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

}
