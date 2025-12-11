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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
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
            // Set default role based on registration type
            user.setCurrentRole(registerAsSeller ? "SELLER" : "CUSTOMER");

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

            // Prepare response (use currentRole if present, otherwise infer from linked entities)
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
            System.out.println("[SWITCH-ROLE] Starting: userId=" + id + ", requestedRole=" + role);
            
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            User user = optional.get();
            System.out.println("[SWITCH-ROLE] Current state: isSeller=" + (user.getSeller() != null) + ", isCustomer=" + (user.getCustomer() != null));

            if ("SELLER".equalsIgnoreCase(role)) {
                // Check if user already has a seller entity (even if disconnected)
                    if (user.getSeller() == null) {
                        // Try to find an existing seller record for this user using native query
                        Seller existingSeller = sellerRepository.findByUserIdNative(id);
                        if (existingSeller != null) {
                            // Reuse the existing seller by updating its user reference
                            existingSeller.setUser(user);
                            sellerRepository.save(existingSeller);
                            user.setSeller(existingSeller);
                        } else {
                            // Create a new seller only if one doesn't exist
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
                // Disconnect the seller from user without deleting it or its products
                // This allows users to switch back to seller and keep their products
                // We just clear the user reference in Java, but keep the database foreign key intact
                // so we can find and reconnect to the same seller later
                if (user.getSeller() != null) {
                    // Do not delete or nullify the Seller DB record; just clear the user's in-memory reference
                    // This preserves the seller row (and its seller_id) so it can be reused when switching back
                    user.setSeller(null);
                    System.out.println("[DEBUG] Cleared user->seller reference for user " + id + " (seller kept in DB)");
                }
                
                // Ensure customer entity exists
                if (user.getCustomer() == null) {
                    Customer customer = new Customer();
                    customer.setUser(user);
                    customerRepository.save(customer);
                    user.setCustomer(customer);
                    System.out.println("[DEBUG] Created customer entity for user " + id);
                }
            }
            
            // Set the user's current active role so profile checks are authoritative
            user.setCurrentRole(role.toUpperCase());
            // Save user changes
            userRepository.save(user);
            
            // Flush and reload to ensure we have fresh data from DB
            userRepository.flush();
            user = userRepository.findById(id).orElse(user);
            
            // Build complete response with updated profile data
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
            
            // Include seller info if user is now a seller
            if (user.getSeller() != null) {
                response.put("seller_id", user.getSeller().getId());
                response.put("store_name", user.getSeller().getStoreName());
                response.put("store_description", user.getSeller().getStoreDescription());
                response.put("business_license", user.getSeller().getBusinessLicense());
            }
            
            // Include customer info
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
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            Long id = Long.parseLong(userId);
            var optional = userRepository.findById(id);
            if (optional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = optional.get();

            // Convert file to base64
            String base64Photo = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUri = "data:" + file.getContentType() + ";base64," + base64Photo;

            // Save to database
            user.setProfilePhoto(dataUri);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo uploaded successfully");
            response.put("photoUrl", dataUri);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId format"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        }
    }
}
