package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.dto.RegistrationDTO;
import com.anvistudio.boutique.model.*;
import com.anvistudio.boutique.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Customer-specific operations.
 * Manages profile, orders, addresses, cart, and wishlist for the React frontend.
 */
@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerRestController {

    private final UserService userService;
    private final OrderService orderService;
    private final AddressService addressService;
    private final CartService cartService;
    private final WishlistService wishlistService;
    private final CouponService couponService;
    private final GiftCardService giftCardService;

    public CustomerRestController(UserService userService, OrderService orderService, 
                                  AddressService addressService, CartService cartService, 
                                  WishlistService wishlistService, CouponService couponService, 
                                  GiftCardService giftCardService) {
        this.userService = userService;
        this.orderService = orderService;
        this.addressService = addressService;
        this.cartService = cartService;
        this.wishlistService = wishlistService;
        this.couponService = couponService;
        this.giftCardService = giftCardService;
    }

    // --- PROFILE MANAGEMENT ---

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Customer customer = userService.getCustomerDetailsByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Profile not found"));
        return ResponseEntity.ok(userService.getProfileDTOFromCustomer(customer));
    }

    @PutMapping("/profile")
    public ResponseEntity<Void> updateProfile(Authentication auth, @RequestBody RegistrationDTO profileDTO) {
        userService.updateCustomerProfile(auth.getName(), profileDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody Map<String, String> passwords) {
        try {
            userService.changePassword(
                    auth.getName(),
                    passwords.get("currentPassword"),
                    passwords.get("newPassword"),
                    passwords.get("confirmPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // --- ORDER HISTORY ---

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrdersByUsername(auth.getName()));
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{id}/return")
    public ResponseEntity<Void> returnOrder(@PathVariable Long id) {
        orderService.returnOrder(id);
        return ResponseEntity.ok().build();
    }

    // --- ADDRESS BOOK ---

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses(Authentication auth) {
        return ResponseEntity.ok(addressService.getAddressesByUsername(auth.getName()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(Authentication auth, @RequestBody Address address) {
        // FIXED: Your AddressService.saveAddress only takes Address as argument.
        // The user relationship should be handled inside the service or set here.
        User user = userService.findUserByUsername(auth.getName()).orElseThrow();
        address.setUser(user);
        return ResponseEntity.ok(addressService.saveAddress(address));
        // return ResponseEntity.ok(addressService.saveAddress(auth.getName(), address));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    // --- CART & WISHLIST ---

    @GetMapping("/cart")
    public ResponseEntity<Map<String, Object>> getCart(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName()).orElseThrow();
        List<CartItem> items = cartService.getCartItems(user.getId());
        double total = cartService.getCartTotal(user.getId());
        
        return ResponseEntity.ok(Map.of("items", items, "total", total));
    }

    @PostMapping("/cart/add/{productId}")
    public ResponseEntity<Void> addToCart(Authentication auth, @PathVariable Long productId, @RequestParam int quantity) {
        cartService.addProductToCart(auth.getName(), productId, quantity);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<Wishlist>> getWishlist(Authentication auth) {
        User user = userService.findUserByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(wishlistService.getWishlistItems(user.getId()));
    }

    @PostMapping("/wishlist/add/{productId}")
    public ResponseEntity<Void> addToWishlist(Authentication auth, @PathVariable Long productId) {
        wishlistService.addToWishlist(auth.getName(), productId);
        return ResponseEntity.ok().build();
    }

    // --- OFFERS & WALLET ---

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getAllActiveCoupons());
    }

    @GetMapping("/gift-cards")
    public ResponseEntity<List<GiftCard>> getGiftCards(Authentication auth) {
        return ResponseEntity.ok(giftCardService.getGiftCardsByUsername(auth.getName()));
    }
}