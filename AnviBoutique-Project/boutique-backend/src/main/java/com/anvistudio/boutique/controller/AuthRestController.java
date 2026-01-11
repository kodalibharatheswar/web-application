package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.dto.LoginRequest;
import com.anvistudio.boutique.dto.RegistrationDTO;
import com.anvistudio.boutique.dto.UserSummaryDTO;
import com.anvistudio.boutique.model.User;
// import com.anvistudio.boutique.model.VerificationToken.TokenType;
import com.anvistudio.boutique.security.JwtUtils;
import com.anvistudio.boutique.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller handling Authentication, Registration, and Password Recovery
 * with JWT.
 * This is a comprehensive controller providing all auth endpoints for the React
 * frontend.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthRestController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    public AuthRestController(AuthenticationManager authenticationManager, UserService userService, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    /**
     * POST /api/auth/login
     * Authenticates credentials and returns a JWT token for the React app.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userService.findUserByUsername(loginRequest.getUsername()).orElseThrow();
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            // role is a String, so we don't use .name()
            response.put("user", new UserSummaryDTO(user.getId(), user.getUsername(), user.getRole(), user.getEmailVerified()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }
    // @PostMapping("/login")
    // public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
    //     try {
    //         Authentication authentication = authenticationManager.authenticate(
    //                 new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    //         SecurityContextHolder.getContext().setAuthentication(authentication);
    //         String jwt = jwtUtils.generateJwtToken(authentication);

    //         User user = userService.findUserByUsername(loginRequest.getUsername()).orElseThrow();

    //         Map<String, Object> response = new HashMap<>();
    //         response.put("token", jwt);
    //         // FIXED: Removed .name() because user.getRole() returns a String
    //         response.put("user",
    //                 new UserSummaryDTO(user.getId(), user.getUsername(), user.getRole(), user.getEmailVerified()));

    //         return ResponseEntity.ok(response);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
    //     }
    // }

    /**
     * POST /api/auth/register
     * Handles new customer registration and triggers OTP.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationDTO registrationDTO) {
        try {
            userService.registerCustomer(registrationDTO);
            return ResponseEntity.ok(Map.of("message", "Registration successful! Please check email."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    // @PostMapping("/register")
    // public ResponseEntity<?> registerUser(@RequestBody RegistrationDTO
    // registrationDTO) {
    // try {
    // userService.registerCustomer(registrationDTO);
    // Map<String, String> response = new HashMap<>();
    // response.put("message", "Registration successful! Please check your email for
    // the OTP.");
    // response.put("email", registrationDTO.getUsername());
    // return ResponseEntity.ok(response);
    // } catch (IllegalStateException e) {
    // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error",
    // e.getMessage()));
    // }
    // }

    /**
     * POST /api/auth/verify-otp
     * Verifies the 6-digit code for account activation or password reset.
     */
    // @PostMapping("/verify-otp")
    // public ResponseEntity<?> verifyOtp(@RequestParam String otp,
    //         @RequestParam String email) {
    //     String result = userService.confirmUserAccountWithOtp(otp, email);
    //     if (result.contains("successful")) {
    //         return ResponseEntity.ok(Map.of("message", result));
    //     }
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", result));
    // }

    /**
     * GET /api/auth/me
     * Returns the current logged-in user's sanitized info.
     */
    @GetMapping("/me")
    public ResponseEntity<UserSummaryDTO> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findUserByUsername(auth.getName()).orElseThrow();
        // role is a String
        return ResponseEntity.ok(new UserSummaryDTO(user.getId(), user.getUsername(), user.getRole(), user.getEmailVerified()));
    }
    // @GetMapping("/me")
    // public ResponseEntity<?> getCurrentUser(Authentication auth) {
    // if (auth == null || !auth.isAuthenticated()) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    // }

    // User user = userService.findUserByUsername(auth.getName()).orElse(null);
    // if (user == null)
    // return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    // return ResponseEntity.ok(new UserSummaryDTO(
    // user.getId(),
    // user.getUsername(),
    // user.getRole(),
    // user.getEmailVerified()));
    // }

    /**
     * POST /api/auth/forgot-password
     * Initiates the password recovery flow by sending an OTP.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.findAndCreateResetOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Email not found."));
        }
    }

    /**
     * POST /api/auth/verify-reset-otp
     * Specifically validates an OTP for the password reset flow.
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestParam String otp, @RequestParam String email) {
        // Use confirmUserAccountWithOtp as it exists in your service
        String result = userService.confirmUserAccountWithOtp(otp, email);
        if (result.contains("successful")) {
            return ResponseEntity.ok(Map.of("message", "OTP verified."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", result));
    }
    // @PostMapping("/verify-reset-otp")
    // public ResponseEntity<?> verifyResetOtp(@RequestParam String otp, @RequestParam String email) {
    //     String result = userService.confirmUserAccountWithOtp(otp, email);
    //     if ("valid".equals(result)) {
    //         return ResponseEntity.ok(Map.of("message", "OTP verified. You can now reset your password."));
    //     }
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", result));
    // }

    /**
     * POST /api/auth/reset-password
     * Finalizes the password reset process.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, 
                                          @RequestParam String password,
                                          @RequestParam String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Passwords do not match"));
        }
        try {
            // Your resetPassword takes (String, String)
            userService.resetPassword(email, password);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}

// package com.anvistudio.boutique.controller;

// import com.anvistudio.boutique.dto.RegistrationDTO;
// import com.anvistudio.boutique.model.User;
// import com.anvistudio.boutique.model.VerificationToken.TokenType;
// import com.anvistudio.boutique.service.UserService;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import
// org.springframework.security.authentication.AnonymousAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// /**
// * REST Controller handling Authentication, Registration, and Password
// Recovery.
// * Communicates via JSON with the React frontend.
// */
// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:3000")
// public class AuthRestController {

// private final UserService userService;

// public AuthRestController(UserService userService) {
// this.userService = userService;
// }

// /**
// * POST /api/auth/register
// * Handles new customer registration.
// */
// @PostMapping("/register")
// public ResponseEntity<?> registerUser(@RequestBody RegistrationDTO
// registrationDTO) {
// try {
// userService.registerCustomer(registrationDTO);
// Map<String, String> response = new HashMap<>();
// response.put("message", "Registration successful! Please check your email for
// the OTP.");
// response.put("email", registrationDTO.getUsername());
// return ResponseEntity.ok(response);
// } catch (IllegalStateException e) {
// return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
// }
// }

// /**
// * POST /api/auth/verify-otp
// * Verifies the 6-digit code for account activation or password reset.
// */
// @PostMapping("/verify-otp")
// public ResponseEntity<?> verifyOtp(@RequestParam String otp,
// @RequestParam String email,
// @RequestParam TokenType type) {
// String result = userService.confirmUserAccountWithOtp(otp, email);
// if (result.contains("successful")) {
// return ResponseEntity.ok(Map.of("message", result));
// }
// return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
// }

// /**
// * GET /api/auth/me
// * Returns the current logged-in user's basic info.
// */
// @GetMapping("/me")
// public ResponseEntity<?> getCurrentUser() {
// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
// if (auth == null || !auth.isAuthenticated() || auth instanceof
// AnonymousAuthenticationToken) {
// return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
// }

// User user = userService.findUserByUsername(auth.getName()).orElse(null);
// if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

// Map<String, Object> userInfo = new HashMap<>();
// userInfo.put("username", user.getUsername());
// userInfo.put("role", user.getRole());
// userInfo.put("verified", user.getEmailVerified());

// return ResponseEntity.ok(userInfo);
// }

// /**
// * POST /api/auth/forgot-password
// * Initiates the password recovery flow.
// */
// @PostMapping("/forgot-password")
// public ResponseEntity<?> forgotPassword(@RequestParam String email) {
// try {
// userService.findAndCreateResetOtp(email);
// return ResponseEntity.ok(Map.of("message", "Reset OTP sent to your email."));
// } catch (Exception e) {
// return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
// }
// }
// }