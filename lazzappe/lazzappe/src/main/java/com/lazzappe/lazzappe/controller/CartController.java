package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Cart;
import com.lazzappe.lazzappe.entity.CartItem;
import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Order;
import com.lazzappe.lazzappe.entity.OrderItem;
import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CartItemRepository;
import com.lazzappe.lazzappe.repository.CartRepository;
import com.lazzappe.lazzappe.repository.OrderRepository;
import com.lazzappe.lazzappe.repository.ProductRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Helper method to get the authenticated user from Spring Security context
     */
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        
        // Assuming your UserDetails implementation stores username/email
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.orElse(null);
    }

    /**
     * Verify that the authenticated user is a customer
     */
    private Customer getAuthenticatedCustomer() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return null;
        }
        return user.getCustomer();
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> payload) {
        try {
            // Get authenticated user instead of trusting request
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Object productIdObj = payload.get("productId");
            Object quantityObj = payload.getOrDefault("quantity", 1);
            
            if (productIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "productId is required"));
            }
            
            Long productId = Long.parseLong(productIdObj.toString());
            Integer quantity = Integer.parseInt(quantityObj.toString());

            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
            }

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
            }
            Product product = productOpt.get();

            // Block adding own product to cart
            if (product.getSeller() != null && product.getSeller().getUser() != null) {
                if (Objects.equals(product.getSeller().getUser().getUser_id(), customer.getUser().getUser_id())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Cannot add your own product to the cart"));
                }
            }

            // Check existing quantity in cart
            int existingInCart = 0;
            Optional<Cart> existingCartOpt = cartRepository.findByCustomer(customer);
            if (existingCartOpt.isPresent()) {
                Cart existingCart = existingCartOpt.get();
                List<CartItem> existingItems = cartItemRepository.findByCart(existingCart);
                for (CartItem it : existingItems) {
                    if (it.getProduct().getId().equals(productId)) {
                        existingInCart = it.getQuantity();
                        break;
                    }
                }
            }

            int available = product.getStock() != null ? product.getStock() : 0;
            if (available < existingInCart + quantity) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Insufficient stock", 
                    "available", available, 
                    "inCart", existingInCart
                ));
            }

            // Find or create cart
            Cart cart = existingCartOpt.orElseGet(() -> {
                Cart c = new Cart(customer);
                return cartRepository.save(c);
            });

            // Check existing item
            List<CartItem> items = cartItemRepository.findByCart(cart);
            CartItem found = null;
            for (CartItem it : items) {
                if (it.getProduct().getId().equals(productId)) {
                    found = it;
                    break;
                }
            }
            
            if (found != null) {
                found.setQuantity(found.getQuantity() + quantity);
                found.calculateSubtotal();
                cartItemRepository.save(found);
            } else {
                CartItem it = new CartItem(cart, product, quantity);
                cartItemRepository.save(it);
                found = it;
            }

            Map<String, Object> res = new HashMap<>();
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("cart_item_id", found.getId());
            Map<String, Object> pmap = new HashMap<>();
            pmap.put("product_id", product.getId());
            pmap.put("name", product.getName());
            pmap.put("description", product.getDescription());
            pmap.put("price", product.getPrice());
            pmap.put("image_url", product.getImageUrl());
            itemMap.put("product", pmap);
            itemMap.put("quantity", found.getQuantity());
            res.put("item", itemMap);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add to cart: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            // Get authenticated user's cart only
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Optional<Cart> cartOpt = cartRepository.findByCustomer(customer);
            if (cartOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            Cart cart = cartOpt.get();
            List<Map<String, Object>> out = new ArrayList<>();
            for (CartItem it : cart.getCartItems()) {
                Map<String, Object> m = new HashMap<>();
                m.put("cart_item_id", it.getId());
                Map<String, Object> p = new HashMap<>();
                p.put("product_id", it.getProduct().getId());
                p.put("name", it.getProduct().getName());
                p.put("description", it.getProduct().getDescription());
                p.put("price", it.getProduct().getPrice());
                p.put("image_url", it.getProduct().getImageUrl());
                p.put("stock", it.getProduct().getStock());
                m.put("product", p);
                m.put("quantity", it.getQuantity());
                out.add(m);
            }
            return ResponseEntity.ok(out);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch cart: " + e.getMessage()));
        }
    }

    @PutMapping("/item/{cartItemId}")
    @Transactional
    public ResponseEntity<?> updateCartItem(@PathVariable Long cartItemId, @RequestBody Map<String, Object> payload) {
        try {
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Object quantityObj = payload.get("quantity");
            if (quantityObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "quantity is required"));
            }
            Integer quantity = Integer.parseInt(quantityObj.toString());
            
            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "quantity must be greater than 0"));
            }
            
            Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Cart item not found"));
            }
            CartItem item = itemOpt.get();
            
            // CRITICAL: Verify this cart item belongs to the authenticated user
            if (!item.getCart().getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden - This cart item does not belong to you"));
            }
            
            // Validate stock
            Product product = item.getProduct();
            int available = product.getStock() != null ? product.getStock() : 0;
            if (quantity > available) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Insufficient stock", 
                    "available", available, 
                    "requested", quantity
                ));
            }

            item.setQuantity(quantity);
            item.calculateSubtotal();
            cartItemRepository.save(item);
            
            Map<String, Object> res = new HashMap<>();
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("cart_item_id", item.getId());
            Map<String, Object> pmap = new HashMap<>();
            pmap.put("product_id", item.getProduct().getId());
            pmap.put("name", item.getProduct().getName());
            pmap.put("price", item.getProduct().getPrice());
            itemMap.put("product", pmap);
            itemMap.put("quantity", item.getQuantity());
            res.put("item", itemMap);
            
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update cart item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/item/{cartItemId}")
    @Transactional
    public ResponseEntity<?> deleteCartItem(@PathVariable Long cartItemId) {
        try {
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Cart item not found"));
            }
            CartItem item = itemOpt.get();
            
            // CRITICAL: Verify ownership
            if (!item.getCart().getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden - This cart item does not belong to you"));
            }
            
            cartItemRepository.delete(item);
            return ResponseEntity.ok(Map.of("message", "Cart item deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete cart item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<?> clearCart() {
        try {
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Optional<Cart> cartOpt = cartRepository.findByCustomer(customer);
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                cartItemRepository.deleteAll(cart.getCartItems());
                cartRepository.delete(cart);
            }
            return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to clear cart: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> payload) {
        try {
            // Get authenticated user instead of trusting request
            Customer customer = getAuthenticatedCustomer();
            if (customer == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            String paymentMethod = (String) payload.get("paymentMethod");
            String shippingAddress = (String) payload.get("shippingAddress");
            Object totalObj = payload.get("totalAmount");

            if (paymentMethod == null || shippingAddress == null || totalObj == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "paymentMethod, shippingAddress, and totalAmount are required"
                ));
            }

            BigDecimal totalAmount = new BigDecimal(totalObj.toString());

            Optional<Cart> cartOpt = cartRepository.findByCustomer(customer);
            if (cartOpt.isEmpty() || cartOpt.get().getCartItems().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Cart is empty"));
            }

            Cart cart = cartOpt.get();

            // Calculate actual total from cart to prevent manipulation
            BigDecimal calculatedTotal = BigDecimal.ZERO;
            for (CartItem cartItem : cart.getCartItems()) {
                BigDecimal itemTotal = cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                calculatedTotal = calculatedTotal.add(itemTotal);
            }

            // Verify the total matches (with small tolerance for rounding)
            if (calculatedTotal.subtract(totalAmount).abs().compareTo(new BigDecimal("0.01")) > 0) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Total amount mismatch",
                    "calculated", calculatedTotal,
                    "provided", totalAmount
                ));
            }

            // Verify stock for each cart item
            for (CartItem cartItem : cart.getCartItems()) {
                Product prod = cartItem.getProduct();
                Integer stock = prod.getStock() != null ? prod.getStock() : 0;
                if (cartItem.getQuantity() > stock) {
                    return ResponseEntity.status(400).body(Map.of(
                        "error", "Insufficient stock for product",
                        "product_id", prod.getId(),
                        "product_name", prod.getName(),
                        "available", stock,
                        "requested", cartItem.getQuantity()
                    ));
                }
            }

            // Create order
            Order order = new Order(customer, calculatedTotal, shippingAddress, paymentMethod);
            if ("ONLINE".equals(paymentMethod) || "LAZZAPPEEPAY".equals(paymentMethod)) {
                order.setBillingStatus("PAID");
            }
            orderRepository.save(order);

            // Transfer cart items to order items and decrement stock
            for (CartItem cartItem : cart.getCartItems()) {
                Product prod = cartItem.getProduct();

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(prod);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(prod.getPrice());
                orderItem.calculateSubtotal();
                order.getOrderItems().add(orderItem);

                // Decrement stock
                int remaining = (prod.getStock() != null ? prod.getStock() : 0) - cartItem.getQuantity();
                prod.setStock(Math.max(0, remaining));
                productRepository.save(prod);
            }

            orderRepository.save(order);

            // Clear the cart
            cartItemRepository.deleteAll(cart.getCartItems());
            cartRepository.delete(cart);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Order placed successfully");
            res.put("order_id", order.getId());
            res.put("total_amount", order.getTotalAmount());
            res.put("payment_method", order.getPaymentMethod());
            res.put("status", order.getStatus());
            res.put("billing_status", order.getBillingStatus());

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to place order: " + e.getMessage()));
        }
    }
}