package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public CustomerService (CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Customer regiCustomer(Customer customer) throws Exception {
        // Check if username or email already exists
        Optional<Customer> existingUserByUsername = customerRepository.findByUsername(customer.getUsername());
        if (existingUserByUsername.isPresent()) {
            throw new Exception("Username already taken");
        }

        Optional<Customer> existingUserByEmail = customerRepository.findByEmail(customer.getEmail());
        if (existingUserByEmail.isPresent()) {
            throw new Exception("Email already registered");
        }

        // Set default role if not provided
        if (customer.getRole() == null || customer.getRole().isEmpty()) {
            customer.setRole("CUSTOMER");
        }

        // Hash the password before saving
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        return customerRepository.save(customer);
    }

    public Customer loginUser(String username, String password) throws Exception {
        Optional<Customer> userOptional = customerRepository.findByUsername(username);
        
        if (userOptional.isEmpty()) {
            throw new Exception("Invalid username or password");
        }

        Customer customer = userOptional.get();
        
        // Check if password matches
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new Exception("Invalid username or password");
        }

        return customer;
    }
}