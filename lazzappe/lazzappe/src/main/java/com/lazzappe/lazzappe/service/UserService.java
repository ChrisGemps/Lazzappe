package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.repository.UserRepository;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.SellerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final CustomerService customerService;
    private final SellerService sellerService;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository, 
                       SellerRepository sellerRepository, CustomerService customerService, 
                       SellerService sellerService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.customerService = customerService;
        this.sellerService = sellerService;
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

        // Customer-specific info
        if ("CUSTOMER".equals(user.getRole())) {
            Optional<Customer> custOpt = customerRepository.findByUserUsername(user.getUsername());
            custOpt.ifPresent(c -> {
                profile.put("shipping_address", c.getShipping_address());
                profile.put("billing_address", c.getBilling_address());
                profile.put("customer_id", c.getCustomer_id());
            });
        }

        // Seller-specific info
        if ("SELLER".equals(user.getRole())) {
            Optional<Seller> sellerOpt = sellerRepository.findByUser(user);
            sellerOpt.ifPresent(s -> {
                profile.put("store_name", s.getStore_name());
                profile.put("store_description", s.getStore_description());
                profile.put("business_license", s.getBusiness_license());
                profile.put("seller_id", s.getSeller_id());
            });
        }

        return profile;
    }

    @Transactional
    public Map<String, Object> updateFullProfile(Long userId, Map<String, Object> updates) throws Exception {
        User user = getUserById(userId);

        // Update user fields
        if (updates.containsKey("username")) user.setUsername((String) updates.get("username"));
        if (updates.containsKey("email")) user.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone_number")) user.setPhone_number((String) updates.get("phone_number"));
        userRepository.save(user);

        // Update customer info
        if ("CUSTOMER".equals(user.getRole())) {
            String shipping = (String) updates.get("shipping_address");
            String billing = (String) updates.get("billing_address");

            Optional<Customer> custOpt = customerRepository.findByUserUsername(user.getUsername());
            if (custOpt.isPresent()) {
                Customer c = custOpt.get();
                c.setShipping_address(shipping);
                c.setBilling_address(billing);
                customerRepository.save(c);
            } else {
                customerService.insertCustomer(user, shipping, billing);
            }
        }

        // Update seller info
        if ("SELLER".equals(user.getRole())) {
            String storeName = (String) updates.get("store_name");
            String storeDesc = (String) updates.get("store_description");
            String busLic = (String) updates.get("business_license");

            Optional<Seller> sellerOpt = sellerRepository.findByUser(user);
            if (sellerOpt.isPresent()) {
                Seller s = sellerOpt.get();
                s.setStore_name(storeName);
                s.setStore_description(storeDesc);
                s.setBusiness_license(busLic);
                sellerRepository.save(s);
            } else {
                sellerService.insertSeller(user, storeName, storeDesc, busLic);
            }
        }

        return getFullProfile(userId);
    }

    @Transactional
    public User updateRoleOnly(Long userId, String newRole) throws Exception {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User switchRole(Long userId, String newRole) throws Exception {
        User user = getUserById(userId);
        updateRoleOnly(userId, newRole);

        if ("CUSTOMER".equals(newRole)) customerService.insertCustomerIfNotExists(user);
        else if ("SELLER".equals(newRole)) sellerService.insertSellerIfNotExists(user);

        return getUserById(userId);
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
}
