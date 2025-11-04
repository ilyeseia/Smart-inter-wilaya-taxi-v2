package com.smarttaxi.userservice.dto;

import java.util.Set;

public class UserAuthenticationResponse {
    
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String token;
    private Set<String> roles;
    private Boolean isVerified;
    private Boolean isActive;
    
    // Constructors
    public UserAuthenticationResponse() {}
    
    public UserAuthenticationResponse(Long userId, String email, String firstName, String lastName, 
                                    String token, Set<String> roles, Boolean isVerified, Boolean isActive) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.token = token;
        this.roles = roles;
        this.isVerified = isVerified;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public Set<String> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}