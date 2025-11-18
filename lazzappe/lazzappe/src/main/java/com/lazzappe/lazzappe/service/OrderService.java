package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Order;
import com.lazzappe.lazzappe.entity.OrderItem;
import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.OrderRepository;
import com.lazzappe.lazzappe.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    public Order createOrder(String username, List<Map<String, Object>> items) throws Exception {
        // Find customer by username (or create placeholder)
        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        Customer customer = customerOpt.orElseThrow(() -> new Exception("Customer not found"));

        // Create order
        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("PENDING");

        BigDecimal total = BigDecimal.ZERO;

        // Add items to order
        for (Map<String, Object> it : items) {
            Long productId = ((Number) it.get("id")).longValue();
            Integer qty = ((Number) it.getOrDefault("qty", 1)).intValue();
            BigDecimal price = BigDecimal.valueOf(((Number) it.getOrDefault("price", 0)).doubleValue());

            // Lookup product (optional; could use dummy if not found)
            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isPresent()) {
                Product product = prodOpt.get();
                OrderItem item = new OrderItem(order, product, qty, price);
                item.calculateSubtotal();
                order.getOrderItems().add(item);
                total = total.add(item.getSubtotal());
            }
        }

        order.setTotal_amount(total);
        return orderRepository.save(order);
    }
}
