package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.repository.ProductRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ProductService(ProductRepository productRepository, SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerSellerId(sellerId);
    }

    public Optional<Product> getProductById(Long productId) {
        return productRepository.findById(productId);
    }

    public Product createProduct(Map<String, Object> productData) throws Exception {
        Long sellerId = Long.parseLong(productData.get("seller_id").toString());
        
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            throw new Exception("Seller not found. Please ensure you have a seller account.");
        }

        Product product = new Product();
        product.setSeller(sellerOpt.get());
        product.setName((String) productData.get("name"));
        product.setDescription((String) productData.get("description"));
        
        // Convert price to BigDecimal
        if (productData.get("price") instanceof Number) {
            product.setPrice(BigDecimal.valueOf(((Number) productData.get("price")).doubleValue()));
        } else {
            product.setPrice(new BigDecimal(productData.get("price").toString()));
        }
        
        product.setStock(((Number) productData.get("stock")).intValue());
        product.setCategory((String) productData.get("category"));
        
        if (productData.containsKey("image_url")) {
            product.setImage_url((String) productData.get("image_url"));
        }
        
        product.setCreated_at(LocalDateTime.now());

        return productRepository.save(product);
    }

    public Product updateProduct(Long productId, Map<String, Object> productData) throws Exception {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new Exception("Product not found");
        }

        Product product = productOpt.get();
        
        if (productData.containsKey("name")) {
            product.setName((String) productData.get("name"));
        }
        if (productData.containsKey("description")) {
            product.setDescription((String) productData.get("description"));
        }
        if (productData.containsKey("price")) {
            if (productData.get("price") instanceof Number) {
                product.setPrice(BigDecimal.valueOf(((Number) productData.get("price")).doubleValue()));
            } else {
                product.setPrice(new BigDecimal(productData.get("price").toString()));
            }
        }
        if (productData.containsKey("stock")) {
            product.setStock(((Number) productData.get("stock")).intValue());
        }
        if (productData.containsKey("category")) {
            product.setCategory((String) productData.get("category"));
        }
        if (productData.containsKey("image_url")) {
            product.setImage_url((String) productData.get("image_url"));
        }

        return productRepository.save(product);
    }

    public boolean deleteProduct(Long productId) {
        if (productRepository.existsById(productId)) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
}   