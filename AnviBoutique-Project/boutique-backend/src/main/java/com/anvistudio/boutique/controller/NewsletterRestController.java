package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Newsletter operations.
 * Allows guest users to subscribe to the newsletter via the React frontend.
 */
@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "http://localhost:3000")
public class NewsletterRestController {

    private final NotificationService notificationService;

    public NewsletterRestController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * POST /api/newsletter/subscribe
     * Handles newsletter subscription requests from the footer or landing pages.
     * @param payload Map containing the 'email' string.
     */
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Map<String, String> response = new HashMap<>();

        try {
            notificationService.subscribeEmail(email);
            response.put("message", "Successfully subscribed to our newsletter!");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // This captures cases like "Already subscribed" or "Registered user must use profile"
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}