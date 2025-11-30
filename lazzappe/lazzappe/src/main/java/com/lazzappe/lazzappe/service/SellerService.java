package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Seller;
import com.lazzappe.lazzappe.entity.User;
import com.lazzappe.lazzappe.repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.Optional;

@Service
public class SellerService {

    private final SellerRepository sellerRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public SellerService(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @Transactional
    public Seller insertSeller(User user, String storeName, String storeDescription, String businessLicense) {
        Seller seller = new Seller();
        seller.setUser(user);
        seller.setStore_name(storeName);
        seller.setStore_description(storeDescription);
        seller.setBusiness_license(businessLicense);

        Seller savedSeller = sellerRepository.save(seller);
        entityManager.flush();

        return savedSeller;
    }

    @Transactional
    public Seller updateSellerInfo(User user, String storeName, String storeDescription, String businessLicense) {
        Optional<Seller> sellerOptional = sellerRepository.findByUser(user);
        if (sellerOptional.isEmpty()) throw new RuntimeException("Seller not found for user");

        Seller seller = sellerOptional.get();
        seller.setStore_name(storeName);
        seller.setStore_description(storeDescription);
        seller.setBusiness_license(businessLicense);

        Seller updatedSeller = sellerRepository.save(seller);
        entityManager.flush();

        return updatedSeller;
    }

    public Optional<Seller> findById(Long id) {
        return sellerRepository.findById(id);
    }

    public Seller save(Seller seller) {
        return sellerRepository.save(seller);
    }


    /**
     * Ensure a Seller exists for the given User. If absent, create a minimal Seller record.
     */
    @Transactional
    public Seller insertSellerIfNotExists(User user) {
        Optional<Seller> existing = sellerRepository.findByUser(user);
        if (existing.isPresent()) return existing.get();

        // Create with empty store info when none provided
        return insertSeller(user, "", "", "");
    }
}
