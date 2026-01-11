package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.User;
import com.anvistudio.boutique.model.Wishlist;
import com.anvistudio.boutique.service.UserService;
import com.anvistudio.boutique.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Wishlist operations.
 * Allows users to save and manage favorite products via the React frontend.
 */
@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistRestController {

    private final WishlistService wishlistService;
    private final UserService userService;

    public WishlistRestController(WishlistService wishlistService, UserService userService) {
        this.wishlistService = wishlistService;
        this.userService = userService;
    }

    /**
     * GET /api/wishlist
     * Retrieves all items in the authenticated user's wishlist.
     */
    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlist(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + auth.getName()));
        
        return ResponseEntity.ok(wishlistService.getWishlistItems(user.getId()));
    }

    /**
     * POST /api/wishlist/add/{productId}
     * Adds a specific product to the user's wishlist.
     */
    @PostMapping("/add/{productId}")
    public ResponseEntity<Void> addToWishlist(Authentication auth, @PathVariable Long productId) {
        wishlistService.addToWishlist(auth.getName(), productId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/wishlist/remove/{productId}
     * Removes a product from the user's wishlist.
     */
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(Authentication auth, @PathVariable Long productId) {
        User user = userService.findUserByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.noContent().build();
    }
}