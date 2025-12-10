package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Cart;
import com.lazzappe.lazzappe.entity.CartItem;
import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CartItemRepository;
import com.lazzappe.lazzappe.repository.CartRepository;
import com.lazzappe.lazzappe.repository.ProductRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> payload) {
        try {
            Object userIdObj = payload.get("userId");
            Object productIdObj = payload.get("productId");
            Object quantityObj = payload.getOrDefault("quantity", 1);
            if (userIdObj == null || productIdObj == null) return ResponseEntity.badRequest().body(Map.of("error", "userId and productId are required"));
            Long userId = Long.parseLong(userIdObj.toString());
            Long productId = Long.parseLong(productIdObj.toString());
            Integer quantity = Integer.parseInt(quantityObj.toString());

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = userOpt.get();
            if (user.getCustomer() == null) return ResponseEntity.status(400).body(Map.of("error", "User is not a customer"));
            Customer customer = user.getCustomer();

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
            Product product = productOpt.get();

            // Block adding own product to cart
            if (product.getSeller() != null && product.getSeller().getUser() != null && product.getSeller().getUser().getUser_id() != null) {
                if (Objects.equals(product.getSeller().getUser().getUser_id(), userId)) {
                    return ResponseEntity.status(403).body(Map.of("error", "Cannot add your own product to the cart"));
                }
            }

            // find or create cart
            Cart cart = cartRepository.findByCustomer(customer).orElseGet(() -> {
                Cart c = new Cart(customer);
                return cartRepository.save(c);
            });

            // check existing item
            List<CartItem> items = cartItemRepository.findByCart(cart);
            CartItem found = null;
            for (CartItem it : items) {
                if (it.getProduct().getId().equals(productId)) { found = it; break; }
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
            Map<String,Object> pmap = new HashMap<>();
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

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = userOpt.get();
            if (user.getCustomer() == null) return ResponseEntity.status(400).body(Map.of("error", "User is not a customer"));
            Customer customer = user.getCustomer();
            Optional<Cart> cartOpt = cartRepository.findByCustomer(customer);
            if (cartOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());
            Cart cart = cartOpt.get();
            List<Map<String, Object>> out = new ArrayList<>();
            for (CartItem it : cart.getCartItems()) {
                Map<String, Object> m = new HashMap<>();
                m.put("cart_item_id", it.getId());
                Map<String,Object> p = new HashMap<>();
                p.put("product_id", it.getProduct().getId());
                p.put("name", it.getProduct().getName());
                p.put("description", it.getProduct().getDescription());
                p.put("price", it.getProduct().getPrice());
                p.put("image_url", it.getProduct().getImageUrl());
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

    // Update quantity of a cart item
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long cartItemId, @RequestBody Map<String, Object> payload) {
        try {
            Object quantityObj = payload.get("quantity");
            if (quantityObj == null) return ResponseEntity.badRequest().body(Map.of("error", "quantity is required"));
            Integer quantity = Integer.parseInt(quantityObj.toString());
            
            if (quantity <= 0) return ResponseEntity.badRequest().body(Map.of("error", "quantity must be greater than 0"));
            
            Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Cart item not found"));
            CartItem item = itemOpt.get();
            
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

    // Delete a cart item
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable Long cartItemId) {
        try {
            Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Cart item not found"));
            CartItem item = itemOpt.get();
            cartItemRepository.delete(item);
            return ResponseEntity.ok(Map.of("message", "Cart item deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete cart item: " + e.getMessage()));
        }
    }

    // Clear entire cart for a user
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = userOpt.get();
            if (user.getCustomer() == null) return ResponseEntity.status(400).body(Map.of("error", "User is not a customer"));
            Customer customer = user.getCustomer();
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
}
