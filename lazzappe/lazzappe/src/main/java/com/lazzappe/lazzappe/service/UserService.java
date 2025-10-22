package com.lazzappe.lazzappe.service;


import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        // TODO: You should hash the password before saving (e.g., BCrypt)
        // For simplicity, saving plain text password (NOT recommended in production)

        return userRepository.save(user);
    }
}
