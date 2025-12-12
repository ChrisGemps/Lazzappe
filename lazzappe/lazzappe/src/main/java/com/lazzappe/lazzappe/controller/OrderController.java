package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Order;
import com.lazzappe.lazzappe.entity.OrderItem;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.OrderRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

    // Get customer orders by userId
    @GetMapping("/customer/{userId}")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = userOpt.get();
            if (user.getCustomer() == null) return ResponseEntity.status(400).body(Map.of("error", "User is not a customer"));

            List<Order> orders = orderRepository.findByCustomer(user.getCustomer());
            return ResponseEntity.ok(buildOrderResponse(orders));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    // Get seller orders (orders containing items from seller's products)
    @GetMapping("/seller/{userId}")
    public ResponseEntity<?> getSellerOrders(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = userOpt.get();
            if (user.getSeller() == null) return ResponseEntity.status(400).body(Map.of("error", "User is not a seller"));

            Seller seller = user.getSeller();
            List<Order> allOrders = orderRepository.findAll();
            
            // Filter orders that contain items from this seller's products
            List<Order> sellerOrders = new ArrayList<>();
            for (Order order : allOrders) {
                boolean hasSellerItems = order.getOrderItems().stream()
                    .anyMatch(item -> item.getProduct().getSeller() != null && 
                                     item.getProduct().getSeller().getId().equals(seller.getId()));
                if (hasSellerItems) {
                    sellerOrders.add(order);
                }
            }

            return ResponseEntity.ok(buildSellerOrderResponse(sellerOrders, seller.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller orders: " + e.getMessage()));
        }
    }

    // Update order status
    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, Object> payload) {
        try {
            String status = (String) payload.get("status");
            if (status == null) return ResponseEntity.badRequest().body(Map.of("error", "status is required"));

            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Order not found"));

            Order order = orderOpt.get();
            order.setStatus(status);
            // If marking as delivered, set billing status to PAID
            if ("DELIVERED".equals(status)) {
                order.setBillingStatus("PAID");
            }
            orderRepository.save(order);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Order status updated");
            res.put("order_id", order.getId());
            res.put("status", order.getStatus());
            res.put("billing_status", order.getBillingStatus());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update order: " + e.getMessage()));
        }
    }

    // Accept/confirm order (seller action)
    @PutMapping("/{orderId}/accept")
    @Transactional
    public ResponseEntity<?> acceptOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Order not found"));

            Order order = orderOpt.get();
            if (!order.getStatus().equals("PENDING")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only pending orders can be accepted"));
            }
            
            order.setStatus("PROCESSING");
            orderRepository.save(order);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Order accepted and set to processing");
            res.put("order_id", order.getId());
            res.put("status", order.getStatus());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to accept order: " + e.getMessage()));
        }
    }

    // Cancel order (seller action)
    @PutMapping("/{orderId}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Order not found"));

            Order order = orderOpt.get();
            if (order.getStatus().equals("DELIVERED") || order.getStatus().equals("SHIPPING")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot cancel orders that are already shipping or delivered"));
            }
            
            order.setStatus("CANCELLED");
            orderRepository.save(order);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Order cancelled successfully");
            res.put("order_id", order.getId());
            res.put("status", order.getStatus());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to cancel order: " + e.getMessage()));
        }
    }

    // Build order response for customer
    private List<Map<String, Object>> buildOrderResponse(List<Order> orders) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order order : orders) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("order_id", order.getId());
            orderMap.put("order_date", order.getOrderDate());
            orderMap.put("total_amount", order.getTotalAmount());
            orderMap.put("status", order.getStatus());
            orderMap.put("billing_status", order.getBillingStatus());
            orderMap.put("shipping_address", order.getShippingAddress());
            orderMap.put("payment_method", order.getPaymentMethod());
            
            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem item : order.getOrderItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("order_item_id", item.getId());
                itemMap.put("product_id", item.getProduct().getId());
                itemMap.put("product_name", item.getProduct().getName());
                // include product image URL for frontend thumbnails
                try {
                    itemMap.put("image_url", item.getProduct().getImageUrl());
                } catch (Exception e) {
                    itemMap.put("image_url", null);
                }
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getPrice());
                itemMap.put("subtotal", item.getSubtotal());
                items.add(itemMap);
            }
            orderMap.put("items", items);
            result.add(orderMap);
        }
        return result;
    }

    // Build order response for seller (filtered by seller's items)
    private List<Map<String, Object>> buildSellerOrderResponse(List<Order> orders, Long sellerId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order order : orders) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("order_id", order.getId());
            orderMap.put("order_date", order.getOrderDate());
            orderMap.put("total_amount", order.getTotalAmount());
            orderMap.put("status", order.getStatus());
            orderMap.put("billing_status", order.getBillingStatus());
            orderMap.put("shipping_address", order.getShippingAddress());
            orderMap.put("payment_method", order.getPaymentMethod());
            orderMap.put("customer_name", order.getCustomer().getUser().getUsername());

            // Only include items from this seller's products
            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct().getSeller() != null && 
                    item.getProduct().getSeller().getId().equals(sellerId)) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("order_item_id", item.getId());
                    itemMap.put("product_id", item.getProduct().getId());
                    itemMap.put("product_name", item.getProduct().getName());
                    // include product image URL for frontend thumbnails
                    try {
                        itemMap.put("image_url", item.getProduct().getImageUrl());
                    } catch (Exception e) {
                        itemMap.put("image_url", null);
                    }
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    itemMap.put("subtotal", item.getSubtotal());
                    items.add(itemMap);
                }
            }
            
            if (!items.isEmpty()) {
                orderMap.put("items", items);
                result.add(orderMap);
            }
        }
        return result;
    }
}
