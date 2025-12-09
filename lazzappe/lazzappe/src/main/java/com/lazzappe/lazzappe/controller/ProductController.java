package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.repository.ProductRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    

    private Map<String, Object> productToMap(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("product_id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("image_url", p.getImageUrl());
        map.put("category", p.getCategory());
        if (p.getSeller() != null) {
            map.put("seller_id", p.getSeller().getId());
            try {
                if (p.getSeller().getUser() != null) map.put("seller_user_id", p.getSeller().getUser().getUser_id());
            } catch (Exception e) {
                // ignore
            }
        }
        map.put("created_at", p.getCreatedAt());
        return map;
    }

    @GetMapping("")
    public ResponseEntity<?> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Product p : products) out.add(productToMap(p));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getProductsBySeller(@PathVariable Long sellerId) {
        // Try finding seller by id, else by user's id
            Optional<Seller> seller = sellerRepository.findById(sellerId);
        if (seller.isEmpty()) {
            // try by user id
                Seller s = sellerRepository.findByUserId(sellerId);
            if (s == null) return ResponseEntity.ok(Collections.emptyList());
            seller = Optional.of(s);
        }
        List<Product> products = productRepository.findBySeller(seller.get());
        List<Map<String, Object>> out = new ArrayList<>();
        for (Product p : products) out.add(productToMap(p));
        return ResponseEntity.ok(out);
    }

    @PostMapping("")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String description = (String) payload.getOrDefault("description", "");
            Object priceObj = payload.get("price");
            Object stockObj = payload.get("stock");
            String imageUrl = (String) payload.getOrDefault("image_url", null);
            String category = (String) payload.getOrDefault("category", null);
            Object sellerObj = payload.get("seller_id");
            if (name == null || priceObj == null || stockObj == null || sellerObj == null)
                return ResponseEntity.badRequest().body(Map.of("error", "name, price, stock, seller_id are required"));

            Long sellerId = Long.parseLong(sellerObj.toString());
            Optional<Seller> seller = sellerRepository.findById(sellerId);
            if (seller.isEmpty()) {
                // try to find seller by user id
                Seller s = sellerRepository.findByUserId(sellerId);
                if (s == null) return ResponseEntity.status(404).body(Map.of("error", "Seller not found"));
                seller = Optional.of(s);
            }

            BigDecimal price = new BigDecimal(priceObj.toString());
            Integer stock = Integer.parseInt(stockObj.toString());
            Product p = new Product();
            p.setName(name);
            p.setDescription(description);
            p.setPrice(price);
            p.setStock(stock);
            p.setImageUrl(imageUrl);
            p.setCategory(category);
            p.setSeller(seller.get());
            productRepository.save(p);
            return ResponseEntity.ok(productToMap(p));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Optional<Product> optional = productRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
            Product p = optional.get();
            if (payload.containsKey("name")) p.setName((String) payload.get("name"));
            if (payload.containsKey("description")) p.setDescription((String) payload.get("description"));
            if (payload.containsKey("price")) p.setPrice(new BigDecimal(payload.get("price").toString()));
            if (payload.containsKey("stock")) p.setStock(Integer.parseInt(payload.get("stock").toString()));
            if (payload.containsKey("image_url")) p.setImageUrl((String) payload.get("image_url"));
            if (payload.containsKey("category")) p.setCategory((String) payload.get("category"));
            if (payload.containsKey("seller_id")) {
                Long sellerId = Long.parseLong(payload.get("seller_id").toString());
                Optional<Seller> seller = sellerRepository.findById(sellerId);
                if (seller.isEmpty()) {
                    Seller s = sellerRepository.findByUserId(sellerId);
                    if (s == null) return ResponseEntity.status(404).body(Map.of("error", "Seller not found"));
                    seller = Optional.of(s);
                }
                p.setSeller(seller.get());
            }
            productRepository.save(p);
            return ResponseEntity.ok(productToMap(p));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update product: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            Optional<Product> optional = productRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
            productRepository.delete(optional.get());
            return ResponseEntity.ok(Map.of("message", "Product deleted"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete product: " + e.getMessage()));
        }
    }
}
