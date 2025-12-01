package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.CartItem;
import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Helper to convert CartItem entity to DTO map
    private Map<String, Object> toCartItemDto(CartItem item) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("cart_item_id", item.getCart_item_id());
        dto.put("quantity", item.getQuantity());
        
        // Nested product DTO
        Product product = item.getProduct();
        if (product != null) {
            Map<String, Object> productDto = new HashMap<>();
            productDto.put("product_id", product.getProduct_id());
            productDto.put("name", product.getName());
            productDto.put("description", product.getDescription());
            productDto.put("price", product.getPrice() != null ? product.getPrice().doubleValue() : 0.0);
            productDto.put("image_url", product.getImage_url());
            productDto.put("category", product.getCategory());
            dto.put("product", productDto);
        }
        
        return dto;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            Long productId = Long.parseLong(body.get("productId").toString());
            Integer qty = Integer.parseInt(body.getOrDefault("quantity", 1).toString());

            CartItem item = cartService.addItemToCart(userId, productId, qty);
            return ResponseEntity.ok(Map.of("message", "Item added", "item", toCartItemDto(item)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            List<CartItem> items = cartService.getCartItemsForUser(userId);
            List<Map<String, Object>> dtos = items.stream()
                    .map(this::toCartItemDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<?> getCartByUsername(@PathVariable String username) {
        try {
            List<CartItem> items = cartService.getCartItemsForUsername(username);
            List<Map<String, Object>> dtos = items.stream()
                    .map(this::toCartItemDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long cartItemId, @RequestBody Map<String, Object> body) {
        try {
            Integer qty = Integer.parseInt(body.get("quantity").toString());
            CartItem item = cartService.updateCartItemQuantity(cartItemId, qty);
            return ResponseEntity.ok(Map.of("message", "Item updated", "item", toCartItemDto(item)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long cartItemId) {
        try {
            boolean ok = cartService.removeCartItem(cartItemId);
            if (ok) return ResponseEntity.ok(Map.of("message", "Item removed"));
            else return ResponseEntity.badRequest().body(Map.of("error", "Item not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            cartService.clearCartForUser(userId);
            return ResponseEntity.ok(Map.of("message", "Cart cleared"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
