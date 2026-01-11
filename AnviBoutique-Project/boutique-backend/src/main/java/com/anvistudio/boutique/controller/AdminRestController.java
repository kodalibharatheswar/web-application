package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.*;
import com.anvistudio.boutique.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Administrative operations.
 * Handles product management, order processing, and content moderation via JSON.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminRestController {

    private final ProductService productService;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final ContactService contactService;
    private final UserService userService;

    public AdminRestController(ProductService productService, OrderService orderService, 
                               ReviewService reviewService, ContactService contactService, 
                               UserService userService) {
        this.productService = productService;
        this.orderService = orderService;
        this.reviewService = reviewService;
        this.contactService = contactService;
        this.userService = userService;
    }

    // --- PRODUCT MANAGEMENT ---

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.saveProduct(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- ORDER MANAGEMENT ---

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        Order order = orderService.getOrderById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        return ResponseEntity.ok(orderService.saveOrder(order));
    }

    // --- REVIEW MODERATION ---

    @GetMapping("/reviews/unapproved")
    public ResponseEntity<List<Review>> getUnapprovedReviews() {
        return ResponseEntity.ok(reviewService.getUnapprovedReviews());
    }

    @PostMapping("/reviews/{id}/approve")
    public ResponseEntity<Void> approveReview(@PathVariable Long id) {
        reviewService.approveReview(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    // --- SUPPORT & MESSAGES ---

    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    // --- ADMIN ACCOUNT SECURITY ---

    @GetMapping("/check-credentials")
    public ResponseEntity<Map<String, Boolean>> checkCredentials(Authentication auth) {
        boolean isUpdated = userService.isAdminCredentialsUpdated(auth.getName());
        return ResponseEntity.ok(Map.of("isUpdated", isUpdated));
    }
}