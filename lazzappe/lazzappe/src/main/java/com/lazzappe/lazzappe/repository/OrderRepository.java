package com.lazzappe.lazzappe.repository;

import com.lazzappe.lazzappe.entity.Order;
import com.lazzappe.lazzappe.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(Customer customer);
}
