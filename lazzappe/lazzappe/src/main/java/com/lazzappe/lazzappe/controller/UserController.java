package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import com.lazzappe.lazzappe.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Helper method to get the authenticated user from Spring Security context
     */
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.orElse(null);
    }

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> payload) {
        try {
            String username = (String) payload.get("username");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String phoneNumber = (String) payload.getOrDefault("phone_number", null);
            String shippingAddress = (String) payload.get("shipping_address");
            String billingAddress = (String) payload.getOrDefault("billing_address", shippingAddress);
            Object raObj = payload.getOrDefault("register_as_seller", payload.get("registerAsSeller"));
            Boolean registerAsSeller = false;
            if (raObj instanceof Boolean) {
                registerAsSeller = (Boolean) raObj;
            } else if (raObj instanceof String) {
                registerAsSeller = Boolean.parseBoolean((String) raObj);
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password); // TODO: Encode password with BCryptPasswordEncoder
            user.setPhone_number(phoneNumber);
            user.setCurrentRole(registerAsSeller ? "SELLER" : "CUSTOMER");

            userRepository.save(user);

            Customer customer = new Customer();
            customer.setUser(user);
            customer.setShippingAddress(shippingAddress);
            customer.setBillingAddress(billingAddress);
            customerRepository.save(customer);
            user.setCustomer(customer);

            Seller seller = null;
            if (registerAsSeller) {
                String storeName = (String) payload.get("store_name");
                String storeDescription = (String) payload.get("store_description");
                String businessLicense = (String) payload.getOrDefault("business_license", null);

                seller = new Seller();
                seller.setUser(user);
                seller.setStoreName(storeName);
                seller.setStoreDescription(storeDescription);
                seller.setBusinessLicense(businessLicense);

                sellerRepository.save(seller);
                user.setSeller(seller);
            }

            userRepository.save(user);

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

            Optional<User> userOpt;

            if (usernameOrEmail.contains("@")) {
                userOpt = userRepository.findByEmail(usernameOrEmail);
            } else {
                userOpt = userRepository.findByUsername(usernameOrEmail);
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            if (!user.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
            }

            String token = jwtUtil.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user_id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone_number", user.getPhone_number());
            response.put("profilePhoto", user.getProfilePhoto());
            response.put("isCustomer", user.getCustomer() != null);
            response.put("isSeller", user.getSeller() != null);
            String role = (user.getCurrentRole() != null) ? user.getCurrentRole() : (user.getSeller() != null ? "SELLER" : "CUSTOMER");
            response.put("role", role);
            if (user.getSeller() != null) {
                response.put("seller_id", user.getSeller().getId());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    // ---------------- PROFILE ----------------
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("user_id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone_number", user.getPhone_number());
            response.put("profilePhoto", user.getProfilePhoto());
            response.put("isCustomer", user.getCustomer() != null);
            response.put("isSeller", user.getSeller() != null);
            String role = (user.getCurrentRole() != null) ? user.getCurrentRole() : (user.getSeller() != null ? "SELLER" : "CUSTOMER");
            response.put("role", role);
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
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            String username = (String) payload.getOrDefault("username", user.getUsername());
            String email = (String) payload.getOrDefault("email", user.getEmail());
            String phone = (String) payload.getOrDefault("phone_number", user.getPhone_number());
            user.setUsername(username);
            user.setEmail(email);
            user.setPhone_number(phone);

            if (user.getCustomer() == null) {
                Customer customer = new Customer();
                customer.setUser(user);
                user.setCustomer(customer);
            }
            String shipping = (String) payload.getOrDefault("shipping_address", user.getCustomer().getShippingAddress());
            String billing = (String) payload.getOrDefault("billing_address", user.getCustomer().getBillingAddress());
            user.getCustomer().setShippingAddress(shipping);
            user.getCustomer().setBillingAddress(billing);

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
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            String currentPassword = (String) payload.get("currentPassword");
            String newPassword = (String) payload.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "currentPassword and newPassword are required"));
            }

            if (!user.getPassword().equals(currentPassword)) {
                return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
            }
            
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
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            String role = (String) payload.get("role");
            if (role == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "role is required"));
            }

            System.out.println("[SWITCH-ROLE] Starting: userId=" + user.getUser_id() + ", requestedRole=" + role);
            System.out.println("[SWITCH-ROLE] Current state: isSeller=" + (user.getSeller() != null) + ", isCustomer=" + (user.getCustomer() != null));

            if ("SELLER".equalsIgnoreCase(role)) {
                if (user.getSeller() == null) {
                    Seller existingSeller = sellerRepository.findByUserIdNative(user.getUser_id());
                    if (existingSeller != null) {
                        existingSeller.setUser(user);
                        sellerRepository.save(existingSeller);
                        user.setSeller(existingSeller);
                    } else {
                        Seller seller = new Seller();
                        seller.setUser(user);
                        seller.setStoreName((String) payload.getOrDefault("store_name", user.getUsername() + "'s Store"));
                        seller.setStoreDescription((String) payload.getOrDefault("store_description", ""));
                        seller.setBusinessLicense((String) payload.getOrDefault("business_license", null));
                        sellerRepository.save(seller);
                        user.setSeller(seller);
                    }
                }
            } else if ("CUSTOMER".equalsIgnoreCase(role)) {
                if (user.getSeller() != null) {
                    user.setSeller(null);
                    System.out.println("[DEBUG] Cleared user->seller reference for user " + user.getUser_id());
                }
                
                if (user.getCustomer() == null) {
                    Customer customer = new Customer();
                    customer.setUser(user);
                    customerRepository.save(customer);
                    user.setCustomer(customer);
                    System.out.println("[DEBUG] Created customer entity for user " + user.getUser_id());
                }
            }
            
            user.setCurrentRole(role.toUpperCase());
            userRepository.save(user);
            userRepository.flush();
            user = userRepository.findById(user.getUser_id()).orElse(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Role switched");
            response.put("user_id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone_number", user.getPhone_number());
            response.put("isCustomer", user.getCustomer() != null);
            response.put("isSeller", user.getSeller() != null);
            String finalRole = (user.getCurrentRole() != null) ? user.getCurrentRole() : (user.getSeller() != null ? "SELLER" : "CUSTOMER");
            response.put("role", finalRole);
            
            if (user.getSeller() != null) {
                response.put("seller_id", user.getSeller().getId());
                response.put("store_name", user.getSeller().getStoreName());
                response.put("store_description", user.getSeller().getStoreDescription());
                response.put("business_license", user.getSeller().getBusinessLicense());
            }
            
            if (user.getCustomer() != null) {
                response.put("shipping_address", user.getCustomer().getShippingAddress());
                response.put("billing_address", user.getCustomer().getBillingAddress());
            }
            
            System.out.println("[SWITCH-ROLE] Success: returning role=" + response.get("role"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[SWITCH-ROLE] ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to switch role: " + e.getMessage()));
        }
    }

    // ---------------- UPLOAD PHOTO ----------------
    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized - Please login"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String base64Photo = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUri = "data:" + file.getContentType() + ";base64," + base64Photo;

            user.setProfilePhoto(dataUri);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo uploaded successfully");
            response.put("photoUrl", dataUri);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        }
    }
}