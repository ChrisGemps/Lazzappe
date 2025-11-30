package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public Customer registerCustomer(Customer customer) throws Exception {
        User user = customer.getUser();

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new Exception("Username already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new Exception("Email already registered");
        }

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        customer.setUser(savedUser);

        return customerRepository.save(customer);
    }

    public Customer loginCustomer(String username, String password) throws Exception {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) throw new Exception("Invalid username or password");

        User user = userOptional.get();
        if (!passwordEncoder.matches(password, user.getPassword())) throw new Exception("Invalid username or password");

        Optional<Customer> customerOptional = customerRepository.findByUser(user);
        if (customerOptional.isEmpty()) throw new Exception("Customer not found for user");

        return customerOptional.get();
    }

    @Transactional
    public Customer insertCustomer(User user, String shippingAddress, String billingAddress) {
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setShipping_address(shippingAddress);
        customer.setBilling_address(billingAddress);

        Customer savedCustomer = customerRepository.save(customer);
        entityManager.flush();

        return savedCustomer;
    }

    @Transactional
    public Customer updateCustomerAddresses(User user, String shippingAddress, String billingAddress) {
        Optional<Customer> customerOptional = customerRepository.findByUser(user);
        if (customerOptional.isEmpty()) throw new RuntimeException("Customer not found for user");

        Customer customer = customerOptional.get();
        customer.setShipping_address(shippingAddress);
        customer.setBilling_address(billingAddress);

        Customer updatedCustomer = customerRepository.save(customer);
        entityManager.flush();

        return updatedCustomer;
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }


    /**
     * Ensure a Customer exists for the given User. If absent, create a minimal Customer record.
     */
    @Transactional
    public Customer insertCustomerIfNotExists(User user) {
        Optional<Customer> existing = customerRepository.findByUser(user);
        if (existing.isPresent()) return existing.get();

        // Create with empty addresses when none provided
        return insertCustomer(user, "", "");
    }
}
