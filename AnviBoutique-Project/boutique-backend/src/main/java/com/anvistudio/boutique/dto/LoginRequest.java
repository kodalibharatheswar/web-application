package com.anvistudio.boutique.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for capturing login credentials from the React frontend.
 */
public class LoginRequest {

    @NotBlank(message = "Username/Email is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}