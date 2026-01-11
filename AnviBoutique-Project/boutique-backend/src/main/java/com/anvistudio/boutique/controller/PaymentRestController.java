package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.CartItem;
import com.anvistudio.boutique.model.Order;
import com.anvistudio.boutique.model.User;
import com.anvistudio.boutique.service.CartService;
import com.anvistudio.boutique.service.OrderService;
import com.anvistudio.boutique.service.StripeService;
import com.anvistudio.boutique.service.UserService;
import com.stripe.exception.StripeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Payment and Checkout operations.
 * Integrates with Stripe and manages order fulfillment for the React frontend.
 */
@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentRestController {

    private final StripeService stripeService;
    private final CartService cartService;
    private final OrderService orderService;
    private final UserService userService;

    public PaymentRestController(StripeService stripeService, CartService cartService, 
                                 OrderService orderService, UserService userService) {
        this.stripeService = stripeService;
        this.cartService = cartService;
        this.orderService = orderService;
        this.userService = userService;
    }

    /**
     * GET /api/payment/config
     * Returns the Stripe publishable key required for the frontend Payment Element.
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", stripeService.getPublishableKey()));
    }

    /**
     * POST /api/payment/create-intent
     * Creates a Stripe Payment Intent and returns the client secret.
     */
    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(Authentication auth) {
        try {
            String clientSecret = stripeService.createPaymentIntent(auth.getName());
            return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Stripe error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/payment/confirm
     * Finalizes the order after a successful payment or for COD.
     * @param paymentMethod "CARD" or "COD"
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmOrder(Authentication auth, @RequestParam String paymentMethod) {
        try {
            User user = userService.findUserByUsername(auth.getName())
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            List<CartItem> cartItems = cartService.getCartItems(user.getId());
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Cart is empty"));
            }

            // Create the order record
            Order order = orderService.createOrderFromCart(user.getId(), cartItems);
            
            // Clear the user's cart
            cartService.clearCart(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully!");
            response.put("orderId", order.getId());
            response.put("paymentMethod", paymentMethod);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Order fulfillment failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/payment/summary
     * Provides a final summary of the cart before payment.
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getCheckoutSummary(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName()).orElseThrow();
        List<CartItem> items = cartService.getCartItems(user.getId());
        double total = cartService.getCartTotal(user.getId());

        Map<String, Object> summary = new HashMap<>();
        summary.put("items", items);
        summary.put("total", total);
        summary.put("itemCount", items.size());

        return ResponseEntity.ok(summary);
    }
}