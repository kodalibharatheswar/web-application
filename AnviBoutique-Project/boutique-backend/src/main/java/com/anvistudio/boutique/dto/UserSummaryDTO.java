package com.anvistudio.boutique.dto;

/**
 * A sanitized version of the User entity to be sent to the React frontend.
 * Excludes sensitive fields like passwords.
 */
public class UserSummaryDTO {

    private Long id;
    private String username;
    private String role;
    private boolean verified;

    public UserSummaryDTO(Long id, String username, String role, boolean verified) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.verified = verified;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}