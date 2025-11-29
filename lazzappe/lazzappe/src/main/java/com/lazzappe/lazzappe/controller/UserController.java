package com.lazzappe.lazzappe.controller;

import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.service.UserService;
import com.lazzappe.lazzappe.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final CustomerService customerService;

    public UserController(UserService userService, CustomerService customerService) {
        this.userService = userService;
        this.customerService = customerService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getUser_id());
            response.put("username", registeredUser.getUsername());
            response.put("email", registeredUser.getEmail());
            response.put("message", "Registration successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            User user = userService.loginUser(username, password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getUser_id());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestBody Map<String, String> request) {
        try {
            String userIdStr = request.get("userId");
            Long userId = Long.parseLong(userIdStr);
            
            Map<String, Object> profile = userService.getFullProfile(userId);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> request) {
        try {
            String userIdStr = (String) request.get("userId");
            Long userId = Long.parseLong(userIdStr);
            
            Map<String, Object> profile = userService.updateFullProfile(userId, request);
            
            Map<String, Object> response = new HashMap<>(profile);
            response.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String userIdStr = request.get("userId");
            Long userId = Long.parseLong(userIdStr);
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            userService.changePassword(userId, currentPassword, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/switch-role")
    public ResponseEntity<?> switchRole(@RequestBody Map<String, String> request) {
        try {
            String userIdStr = request.get("userId");
            Long userId = Long.parseLong(userIdStr);
            String newRole = request.get("role");
            
            User user = userService.switchRole(userId, newRole);
            
            Map<String, Object> profile = userService.getFullProfile(userId);
            profile.put("message", "Role switched successfully");
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}