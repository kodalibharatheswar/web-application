// package com.anvistudio.boutique.controller;

// import com.anvistudio.boutique.service.UserService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// /**
//  * REST Controller for account and email verification.
//  * This controller handles the final verification logic that might be triggered 
//  * via email links or manual code entry in the React frontend.
//  */
// @RestController
// @RequestMapping("/api/verify")
// @CrossOrigin(origins = "http://localhost:3000")
// public class VerificationRestController {

//     private final UserService userService;

//     public VerificationRestController(UserService userService) {
//         this.userService = userService;
//     }

//     /**
//      * GET /api/verify/account
//      * Endpoint to verify a user's account using an OTP sent via email.
//      * This can be used by the React app's verification page.
//      */
//     @GetMapping("/account")
//     public ResponseEntity<?> verifyAccount(@RequestParam String otp, @RequestParam String email) {
//         String result = userService.confirmUserAccountWithOtp(otp, email);
//         Map<String, String> response = new HashMap<>();
        
//         if (result.contains("successful")) {
//             response.put("message", result);
//             response.put("status", "SUCCESS");
//             return ResponseEntity.ok(response);
//         } else {
//             response.put("message", result);
//             response.put("status", "FAILURE");
//             return ResponseEntity.badRequest().body(response);
//         }
//     }

//     /**
//      * POST /api/verify/resend-otp
//      * Endpoint to trigger a new OTP if the previous one expired or was lost.
//      */
//     @PostMapping("/resend-otp")
//     public ResponseEntity<?> resendOtp(@RequestParam String email) {
//         Map<String, String> response = new HashMap<>();
//         try {
//             userService.findUserByUsername(email).ifPresent(user -> {
//                 userService.createOtpAndSendEmail(user);
//             });
//             response.put("message", "A new verification code has been sent to your email.");
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             response.put("error", "Failed to resend OTP. Please try again.");
//             return ResponseEntity.internalServerError().body(response);
//         }
//     }
// }