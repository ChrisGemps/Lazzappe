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
}