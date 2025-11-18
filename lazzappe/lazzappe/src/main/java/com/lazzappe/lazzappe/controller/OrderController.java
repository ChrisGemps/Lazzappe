package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Order;
import com.lazzappe.lazzappe.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Object rawItems = payload.get("items");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = rawItems instanceof List ? (List<Map<String, Object>>) rawItems : null;
            String username = (String) payload.get("username");

            if (items == null || items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
            }

            if (username == null || username.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username required"));
            }

            // Create and persist order via OrderService
            Order order = orderService.createOrder(username, items);

            // Return successful response with order details
            Map<String, Object> resp = Map.of(
                "status", "success",
                "order_id", order.getOrder_id(),
                "username", username,
                "total", order.getTotal_amount(),
                "message", "Order created successfully"
            );

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
