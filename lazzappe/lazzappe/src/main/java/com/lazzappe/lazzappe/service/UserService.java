package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User registerUser(User user) throws Exception {
        // Check if username or email already exists
        Optional<User> existingUserByUsername = userRepository.findByUsername(user.getUsername());
        if (existingUserByUsername.isPresent()) {
            throw new Exception("Username already taken");
        }

        Optional<User> existingUserByEmail = userRepository.findByEmail(user.getEmail());
        if (existingUserByEmail.isPresent()) {
            throw new Exception("Email already registered");
        }

        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User loginUser(String username, String password) throws Exception {
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isEmpty()) {
            throw new Exception("Invalid username or password");
        }

        User user = userOptional.get();
        
        // Check if password matches
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid username or password");
        }

        return user;
    }

    public User getUserById(Long userId) throws Exception {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new Exception("User not found");
        }
        
        return userOptional.get();
    }

    public User updateUserProfile(Long userId, User updatedUser) throws Exception {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new Exception("User not found");
        }
        
        User existingUser = userOptional.get();
        
        // Update only the fields that are allowed to be changed
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
            // Check if new username is already taken by another user
            Optional<User> userWithUsername = userRepository.findByUsername(updatedUser.getUsername());
            if (userWithUsername.isPresent() && !userWithUsername.get().getUser_id().equals(userId)) {
                throw new Exception("Username already taken");
            }
            existingUser.setUsername(updatedUser.getUsername());
        }
        
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            // Check if new email is already taken by another user
            Optional<User> userWithEmail = userRepository.findByEmail(updatedUser.getEmail());
            if (userWithEmail.isPresent() && !userWithEmail.get().getUser_id().equals(userId)) {
                throw new Exception("Email already registered");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        
        if (updatedUser.getPhone_number() != null) {
            existingUser.setPhone_number(updatedUser.getPhone_number());
        }
        
        return userRepository.save(existingUser);
    }

    public boolean changePassword(Long userId, String currentPassword, String newPassword) throws Exception {
    Optional<User> userOptional = userRepository.findById(userId);
    
    if (userOptional.isEmpty()) {
        throw new Exception("User not found");
    }
    
    User user = userOptional.get();
    
    // Verify current password
    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
        throw new Exception("Current password is incorrect");
    }
    
    // Hash and save new password
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    
    return true;
}
}