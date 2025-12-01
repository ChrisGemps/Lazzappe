package com.lazzappe.lazzappe.service;

import com.lazzappe.lazzappe.entity.Cart;
import com.lazzappe.lazzappe.entity.CartItem;
import com.lazzappe.lazzappe.entity.Customer;
import com.lazzappe.lazzappe.entity.Product;
import com.lazzappe.lazzappe.repository.CartItemRepository;
import com.lazzappe.lazzappe.repository.CartRepository;
import com.lazzappe.lazzappe.repository.CustomerRepository;
import com.lazzappe.lazzappe.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       CustomerRepository customerRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public Cart getOrCreateCartForUser(Long userId) throws Exception {
        Optional<Customer> custOpt = customerRepository.findByUserId(userId);
        if (custOpt.isEmpty()) throw new Exception("Customer not found for user");

        Customer customer = custOpt.get();

        // try find cart by customer
        List<Cart> carts = cartRepository.findAll();
        for (Cart c : carts) {
            if (c.getCustomer() != null && c.getCustomer().getCustomer_id().equals(customer.getCustomer_id())) {
                return c;
            }
        }

        // create new cart
        Cart cart = new Cart(customer);
        return cartRepository.save(cart);
    }

    @Transactional
    public CartItem addItemToCart(Long userId, Long productId, Integer quantity) throws Exception {
        Cart cart = getOrCreateCartForUser(userId);

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty()) throw new Exception("Product not found");

        Product product = prodOpt.get();

        // Check if item already exists in cart
        List<CartItem> items = cartItemRepository.findByCartId(cart.getCart_id());
        for (CartItem it : items) {
            if (it.getProduct().getProduct_id().equals(productId)) {
                it.setQuantity(it.getQuantity() + quantity);
                it.calculateSubtotal();
                return cartItemRepository.save(it);
            }
        }

        CartItem item = new CartItem(cart, product, quantity);
        cart.getCartItems().add(item);
        cartRepository.save(cart);
        return item;
    }

    @Transactional
    public CartItem updateCartItemQuantity(Long cartItemId, Integer quantity) throws Exception {
        Optional<CartItem> opt = cartItemRepository.findById(cartItemId);
        if (opt.isEmpty()) throw new Exception("Cart item not found");
        CartItem item = opt.get();
        item.setQuantity(quantity);
        item.calculateSubtotal();
        return cartItemRepository.save(item);
    }

    @Transactional
    public boolean removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) return false;
        cartItemRepository.deleteById(cartItemId);
        return true;
    }

    public List<CartItem> getCartItemsForUser(Long userId) throws Exception {
        Cart cart = getOrCreateCartForUser(userId);
        return cartItemRepository.findByCartId(cart.getCart_id());
    }

    public List<CartItem> getCartItemsForUsername(String username) throws Exception {
        Optional<com.lazzappe.lazzappe.entity.Customer> custOpt = customerRepository.findByUserUsername(username);
        if (custOpt.isEmpty()) throw new Exception("Customer not found for username");
        com.lazzappe.lazzappe.entity.Customer customer = custOpt.get();

        // try to find existing cart for this customer
        Optional<Cart> cartOpt = cartRepository.findByCustomer(customer);
        Cart cart;
        if (cartOpt.isPresent()) {
            cart = cartOpt.get();
        } else {
            cart = new Cart(customer);
            cart = cartRepository.save(cart);
        }

        return cartItemRepository.findByCartId(cart.getCart_id());
    }

    @Transactional
    public void clearCartForUser(Long userId) throws Exception {
        Cart cart = getOrCreateCartForUser(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}
