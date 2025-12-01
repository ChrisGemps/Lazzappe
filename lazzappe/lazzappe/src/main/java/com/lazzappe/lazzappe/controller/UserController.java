package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // allow your React app
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SellerRepository sellerRepository;

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> payload) {
        try {
            // Extract common fields
            String username = (String) payload.get("username");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String phoneNumber = (String) payload.getOrDefault("phone_number", null);
            String shippingAddress = (String) payload.get("shipping_address");
            String billingAddress = (String) payload.getOrDefault("billing_address", shippingAddress);
            Boolean registerAsSeller = (Boolean) payload.getOrDefault("register_as_seller", false);

            // Check for existing username/email
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }

            // Create User entity
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password); // TODO: Encode password with BCryptPasswordEncoder
            user.setPhone_number(phoneNumber);

            userRepository.save(user);

            // Create Customer entity
            Customer customer = new Customer();
            customer.setUser(user);
            customer.setShippingAddress(shippingAddress);
            customer.setBillingAddress(billingAddress);

            customerRepository.save(customer);

            // If registering as seller, create Seller entity
            if (registerAsSeller) {
                String storeName = (String) payload.get("store_name");
                String storeDescription = (String) payload.get("store_description");
                String businessLicense = (String) payload.getOrDefault("business_license", null);

                Seller seller = new Seller();
                seller.setUser(user);
                seller.setStoreName(storeName);
                seller.setStoreDescription(storeDescription);
                seller.setBusinessLicense(businessLicense);

                sellerRepository.save(seller);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, Object> payload) {
        try {
            String usernameOrEmail = (String) payload.get("username");
            String password = (String) payload.get("password");

            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username/email and password are required"));
            }

            User user;

            // Check if input contains '@' → treat as email
            if (usernameOrEmail.contains("@")) {
                user = userRepository.findByEmail(usernameOrEmail);
            } else {
                user = userRepository.findByUsername(usernameOrEmail);
            }

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            // Check password (plain text for now; ideally use BCrypt)
            if (!user.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
            }

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("user_id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone_number", user.getPhone_number());
            response.put("isCustomer", user.getCustomer() != null);
            response.put("isSeller", user.getSeller() != null);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
}
