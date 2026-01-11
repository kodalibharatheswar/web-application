package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.CartItem;
import com.anvistudio.boutique.model.User;
import com.anvistudio.boutique.service.CartService;
import com.anvistudio.boutique.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Shopping Cart operations.
 * Handles adding, updating, and removing items for the React frontend.
 * This separates cart logic from CustomerRestController for better modularity.
 */
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartRestController {

    private final CartService cartService;
    private final UserService userService;

    public CartRestController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    /**
     * GET /api/cart
     * Retrieves the current user's shopping cart items and total price.
     */
    @GetMapping
    public ResponseEntity<?> getCart(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + auth.getName()));

        List<CartItem> items = cartService.getCartItems(user.getId());
        double total = cartService.getCartTotal(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", total);
        response.put("itemCount", items.size());

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/cart/add/{productId}
     * Adds a product to the cart or increments its quantity.
     * Accessible to authenticated customers.
     */
    @PostMapping("/add/{productId}")
    public ResponseEntity<Void> addToCart(Authentication auth, 
                                         @PathVariable Long productId, 
                                         @RequestParam(defaultValue = "1") int quantity) {
        cartService.addProductToCart(auth.getName(), productId, quantity);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/cart/update/{itemId}
     * Updates the quantity of a specific cart item (e.g., from the cart page).
     */
    @PutMapping("/update/{itemId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable Long itemId, 
                                               @RequestParam int quantity) {
        cartService.updateItemQuantity(itemId, quantity);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/cart/remove/{itemId}
     * Removes a specific item from the cart.
     */
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/cart/clear
     * Clears all items from the current user's cart.
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}