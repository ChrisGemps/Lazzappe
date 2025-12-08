package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import com.lazzappe.lazzappe.repository.ProductRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private ProductRepository productRepository;

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

    // ---------------- PROFILE ----------------
    @PostMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestBody Map<String, Object> payload) {
        try {
            Object idObj = payload.get("userId");
            if (idObj == null) return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
            Long id = Long.parseLong(idObj.toString());
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = optional.get();

            Map<String, Object> response = new HashMap<>();
            response.put("user_id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone_number", user.getPhone_number());
            response.put("isCustomer", user.getCustomer() != null);
            response.put("isSeller", user.getSeller() != null);
            response.put("role", user.getSeller() != null ? "SELLER" : "CUSTOMER");
            if (user.getCustomer() != null) {
                response.put("shipping_address", user.getCustomer().getShippingAddress());
                response.put("billing_address", user.getCustomer().getBillingAddress());
            }
            if (user.getSeller() != null) {
                response.put("seller_id", user.getSeller().getId());
                response.put("store_name", user.getSeller().getStoreName());
                response.put("store_description", user.getSeller().getStoreDescription());
                response.put("business_license", user.getSeller().getBusinessLicense());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    // ---------------- UPDATE PROFILE ----------------
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        try {
            Object idObj = payload.get("userId");
            if (idObj == null) return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
            Long id = Long.parseLong(idObj.toString());
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = optional.get();

            // update fields if provided
            String username = (String) payload.getOrDefault("username", user.getUsername());
            String email = (String) payload.getOrDefault("email", user.getEmail());
            String phone = (String) payload.getOrDefault("phone_number", user.getPhone_number());
            user.setUsername(username);
            user.setEmail(email);
            user.setPhone_number(phone);

            // customer fields
            if (user.getCustomer() == null) {
                Customer customer = new Customer();
                customer.setUser(user);
                user.setCustomer(customer);
            }
            String shipping = (String) payload.getOrDefault("shipping_address", user.getCustomer().getShippingAddress());
            String billing = (String) payload.getOrDefault("billing_address", user.getCustomer().getBillingAddress());
            user.getCustomer().setShippingAddress(shipping);
            user.getCustomer().setBillingAddress(billing);

            // seller fields
            if (payload.containsKey("store_name") || payload.containsKey("store_description") || payload.containsKey("business_license")) {
                if (user.getSeller() == null) {
                    Seller seller = new Seller();
                    seller.setUser(user);
                    user.setSeller(seller);
                }
                String storeName = (String) payload.getOrDefault("store_name", user.getSeller().getStoreName());
                String storeDesc = (String) payload.getOrDefault("store_description", user.getSeller().getStoreDescription());
                String license = (String) payload.getOrDefault("business_license", user.getSeller().getBusinessLicense());
                user.getSeller().setStoreName(storeName);
                user.getSeller().setStoreDescription(storeDesc);
                user.getSeller().setBusinessLicense(license);
            }

            userRepository.save(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("user_id", user.getUser_id());
            response.put("role", user.getSeller() != null ? "SELLER" : "CUSTOMER");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    // ---------------- CHANGE PASSWORD ----------------
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> payload) {
        try {
            Object idObj = payload.get("userId");
            String currentPassword = (String) payload.get("currentPassword");
            String newPassword = (String) payload.get("newPassword");
            if (idObj == null || currentPassword == null || newPassword == null) return ResponseEntity.badRequest().body(Map.of("error", "userId, currentPassword, and newPassword are required"));

            Long id = Long.parseLong(idObj.toString());
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = optional.get();
            if (!user.getPassword().equals(currentPassword)) return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
            user.setPassword(newPassword);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password changed"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to change password: " + e.getMessage()));
        }
    }

    // ---------------- SWITCH ROLE ----------------
    @PostMapping("/switch-role")
    @Transactional
    public ResponseEntity<?> switchRole(@RequestBody Map<String, Object> payload) {
        try {
            Object idObj = payload.get("userId");
            String role = (String) payload.get("role");
            if (idObj == null || role == null) return ResponseEntity.badRequest().body(Map.of("error", "userId and role are required"));
            Long id = Long.parseLong(idObj.toString());
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = optional.get();

            if ("SELLER".equalsIgnoreCase(role)) {
                if (user.getSeller() == null) {
                    Seller seller = new Seller();
                    seller.setUser(user);
                    seller.setStoreName((String) payload.getOrDefault("store_name", user.getUsername() + "'s Store"));
                    seller.setStoreDescription((String) payload.getOrDefault("store_description", ""));
                    seller.setBusinessLicense((String) payload.getOrDefault("business_license", null));
                    sellerRepository.save(seller);
                    user.setSeller(seller);
                }
            } else if ("CUSTOMER".equalsIgnoreCase(role)) {
                if (user.getSeller() != null) {
                    // To avoid database errors (Product.seller is non-nullable), delete products associated with the seller
                    try {
                        var seller = user.getSeller();
                            var products = productRepository.findBySeller(seller);
                        if (products != null && !products.isEmpty()) {
                            // Attempt to delete via repository bulk operation to avoid entity state issues and cascade problems
                            try {
                                productRepository.deleteBySeller_Id(seller.getId());
                            } catch (Exception ex) {
                                // fallback to deleteAll just in case
                                productRepository.deleteAll(products);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body(Map.of("error", "Failed to remove products of seller before switching role: " + e.getMessage()));
                    }
                    // Now it's safe to delete the seller
                    sellerRepository.delete(user.getSeller());
                    user.setSeller(null);
                }
                if (user.getCustomer() == null) {
                    Customer customer = new Customer();
                    customer.setUser(user);
                    customerRepository.save(customer);
                    user.setCustomer(customer);
                }
            }
            userRepository.save(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Role switched");
            response.put("role", user.getSeller() != null ? "SELLER" : "CUSTOMER");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to switch role: " + e.getMessage()));
        }
    }
}
