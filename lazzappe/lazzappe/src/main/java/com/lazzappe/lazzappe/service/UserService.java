package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.repository.UserRepository;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository, SellerRepository sellerRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User registerUser(User user) throws Exception {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new Exception("Username already taken");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("Email already registered");
        }

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid username or password");
        }

        return user;
    }

    public User getUserById(Long userId) throws Exception {
        return userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
    }

    public Map<String, Object> getFullProfile(Long userId) throws Exception {
        User user = getUserById(userId);

        Map<String, Object> profile = new HashMap<>();
        profile.put("user_id", user.getUser_id());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("phone_number", user.getPhone_number());
        profile.put("role", user.getRole());

        // Customer-specific fields
        if ("CUSTOMER".equals(user.getRole())) {
            customerRepository.findById(userId).ifPresent(customer -> {
                profile.put("shipping_address", customer.getShipping_address());
                profile.put("billing_address", customer.getBilling_address());
            });
        }

        // Seller-specific fields
        if ("SELLER".equals(user.getRole())) {
            sellerRepository.findById(userId).ifPresent(seller -> {
                profile.put("store_name", seller.getStore_name());
                profile.put("store_description", seller.getStore_description());
                profile.put("business_license", seller.getBusiness_license());
            });
        }

        return profile;
    }

    public User updateUserProfile(Long userId, User updatedUser) throws Exception {
        User existingUser = getUserById(userId);

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
            userRepository.findByUsername(updatedUser.getUsername()).ifPresent(u -> {
                if (!u.getUser_id().equals(userId)) throw new RuntimeException("Username already taken");
            });
            existingUser.setUsername(updatedUser.getUsername());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            userRepository.findByEmail(updatedUser.getEmail()).ifPresent(u -> {
                if (!u.getUser_id().equals(userId)) throw new RuntimeException("Email already registered");
            });
            existingUser.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPhone_number() != null) {
            existingUser.setPhone_number(updatedUser.getPhone_number());
        }

        return userRepository.save(existingUser);
    }

public Map<String, Object> updateFullProfile(Long userId, Map<String, Object> updates) throws Exception {
    User user = getUserById(userId);

    if (updates.containsKey("username")) {
        String username = (String) updates.get("username");
        userRepository.findByUsername(username).ifPresent(u -> {
            if (!u.getUser_id().equals(userId)) throw new RuntimeException("Username already taken");
        });
        user.setUsername(username);
    }

    if (updates.containsKey("email")) {
        String email = (String) updates.get("email");
        userRepository.findByEmail(email).ifPresent(u -> {
            if (!u.getUser_id().equals(userId)) throw new RuntimeException("Email already registered");
        });
        user.setEmail(email);
    }

    if (updates.containsKey("phone_number")) {
        user.setPhone_number((String) updates.get("phone_number"));
    }

    userRepository.save(user);

    // Customer-specific updates
    if ("CUSTOMER".equals(user.getRole())) {
        Optional<Customer> customerOpt = customerRepository.findById(userId);
        
        if (customerOpt.isPresent()) {
            // Update existing customer
            Customer customer = customerOpt.get();
            if (updates.containsKey("shipping_address")) {
                customer.setShipping_address((String) updates.get("shipping_address"));
            }
            if (updates.containsKey("billing_address")) {
                customer.setBilling_address((String) updates.get("billing_address"));
            }
            customerRepository.save(customer);
        } else {
            // Customer doesn't exist - need to insert into customer table only
            // Insert customer row for existing user via native query to avoid joined-inheritance issues
            if (updates.containsKey("shipping_address") || updates.containsKey("billing_address")) {
                String shipping = updates.containsKey("shipping_address") ? (String) updates.get("shipping_address") : null;
                String billing = updates.containsKey("billing_address") ? (String) updates.get("billing_address") : null;
                try {
                    customerRepository.insertCustomer(userId, shipping, billing);
                } catch (Exception e) {
                    // If insert fails due to duplicate key, try to update existing customer instead
                    customerRepository.findById(userId).ifPresent(cust -> {
                        if (shipping != null) cust.setShipping_address(shipping);
                        if (billing != null) cust.setBilling_address(billing);
                        customerRepository.save(cust);
                    });
                }
            }
        }
    }

    // Seller-specific updates
    if ("SELLER".equals(user.getRole())) {
        Optional<Seller> sellerOpt = sellerRepository.findById(userId);
        
        if (sellerOpt.isPresent()) {
            // Update existing seller
            Seller seller = sellerOpt.get();
            if (updates.containsKey("store_name")) {
                seller.setStore_name((String) updates.get("store_name"));
            }
            if (updates.containsKey("store_description")) {
                seller.setStore_description((String) updates.get("store_description"));
            }
            if (updates.containsKey("business_license")) {
                seller.setBusiness_license((String) updates.get("business_license"));
            }
            sellerRepository.save(seller);
        } else {
            // Seller doesn't exist - need to insert into seller table only
            if (updates.containsKey("store_name") || updates.containsKey("store_description") || updates.containsKey("business_license")) {
                String storeName = updates.containsKey("store_name") ? (String) updates.get("store_name") : null;
                String storeDesc = updates.containsKey("store_description") ? (String) updates.get("store_description") : null;
                String businessLicense = updates.containsKey("business_license") ? (String) updates.get("business_license") : null;
                try {
                    sellerRepository.insertSeller(userId, storeName, storeDesc, businessLicense);
                } catch (Exception e) {
                    // If insert fails due to duplicate key, try to update existing seller instead
                    sellerRepository.findById(userId).ifPresent(seller -> {
                        if (storeName != null) seller.setStore_name(storeName);
                        if (storeDesc != null) seller.setStore_description(storeDesc);
                        if (businessLicense != null) seller.setBusiness_license(businessLicense);
                        sellerRepository.save(seller);
                    });
                }
            }
        }
    }

    return getFullProfile(userId);
}

    public boolean changePassword(Long userId, String currentPassword, String newPassword) throws Exception {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new Exception("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return true;
    }

    public User switchRole(Long userId, String newRole) throws Exception {
    User user = getUserById(userId);

    if (!newRole.equals("CUSTOMER") && !newRole.equals("SELLER")) {
        throw new Exception("Invalid role. Must be CUSTOMER or SELLER");
    }

    user.setRole(newRole);
    userRepository.save(user);
    
    // Create Customer record if switching to CUSTOMER (only if doesn't exist)
    if ("CUSTOMER".equals(newRole)) {
        Optional<Customer> customerOpt = customerRepository.findById(userId);
        if (customerOpt.isEmpty()) {
            // Insert customer row using native query to avoid saving a transient subclass instance
            customerRepository.insertCustomer(userId, null, null);
        }
    }
    
    // Create Seller record if switching to SELLER (only if doesn't exist)
    if ("SELLER".equals(newRole)) {
        Optional<Seller> sellerOpt = sellerRepository.findById(userId);
        if (sellerOpt.isEmpty()) {
            // Insert seller row using native query to avoid saving a transient subclass instance
            try {
                sellerRepository.insertSeller(userId, null, null, null);
            } catch (Exception e) {
                // ignore duplicate-key; ensure seller row exists by attempting to load/save
                sellerRepository.findById(userId).orElseGet(() -> {
                    Seller s = new Seller();
                    s.setUser_id(userId);
                    return sellerRepository.save(s);
                });
            }
        }
    }
    
    return user;
}
}