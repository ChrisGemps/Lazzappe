package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Get all products
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            List<Map<String, Object>> dto = products.stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get products by seller
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getProductsBySeller(@PathVariable Long sellerId) {
        try {
            List<Product> products = productService.getProductsBySeller(sellerId);
            List<Map<String, Object>> dto = products.stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        try {
            return productService.getProductById(productId)
                    .map(p -> ResponseEntity.ok(toDto(p)))
                    .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "Product not found")));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Create product
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> productData) {
        try {
            Product product = productService.createProduct(productData);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product created successfully");
            response.put("product", toDto(product));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to save product. " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update product
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, @RequestBody Map<String, Object> productData) {
        try {
            Product product = productService.updateProduct(productId, productData);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product updated successfully");
            response.put("product", toDto(product));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update product. " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete product
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            boolean deleted = productService.deleteProduct(productId);
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Product deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Product not found");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Search products
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String query) {
        try {
            List<Product> products = productService.searchProducts(query);
            List<Map<String, Object>> dto = products.stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        try {
            List<Product> products = productService.getProductsByCategory(category);
            List<Map<String, Object>> dto = products.stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Convert Product entity to a safe DTO (avoid circular references)
    private Map<String, Object> toDto(Product p) {
        Map<String, Object> m = new HashMap<>();
        m.put("product_id", p.getProduct_id());
        m.put("name", p.getName());
        m.put("description", p.getDescription());
        m.put("price", p.getPrice() != null ? p.getPrice().toString() : null);
        m.put("stock", p.getStock());
        m.put("image_url", p.getImage_url());
        m.put("category", p.getCategory());
        m.put("created_at", p.getCreated_at() != null ? p.getCreated_at().toString() : null);
        if (p.getSeller() != null) {
            Map<String, Object> seller = new HashMap<>();
            seller.put("seller_id", p.getSeller().getSeller_id());
            seller.put("store_name", p.getSeller().getStore_name());
            m.put("seller", seller);
        } else {
            m.put("seller", null);
        }
        return m;
    }
}
