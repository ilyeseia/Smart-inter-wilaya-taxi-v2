package com.smarttaxi.userservice.service;

import com.smarttaxi.userservice.dto.*;
import com.smarttaxi.userservice.entity.User;
import com.smarttaxi.userservice.entity.Vehicle;
import com.smarttaxi.userservice.repository.UserRepository;
import com.smarttaxi.userservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
@Validated
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private static final String USER_ROLE = "ROLE_USER";
    private static final String ADMIN_ROLE = "ROLE_ADMIN";
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Register a new user
     * @param registrationRequest user registration data
     * @return UserAuthenticationResponse with JWT token
     */
    public UserAuthenticationResponse registerUser(@Valid UserRegistrationRequest registrationRequest) {
        logger.info("Registering new user with email: {}", registrationRequest.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists: " + registrationRequest.getEmail());
        }
        
        // Check if license number already exists (if provided)
        if (registrationRequest.getLicenseNumber() != null && 
            !registrationRequest.getLicenseNumber().trim().isEmpty() &&
            userRepository.existsByLicenseNumber(registrationRequest.getLicenseNumber())) {
            throw new RuntimeException("License number already exists: " + registrationRequest.getLicenseNumber());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setPhoneNumber(registrationRequest.getPhoneNumber());
        user.setAddress(registrationRequest.getAddress());
        user.setCity(registrationRequest.getCity());
        user.setWilaya(registrationRequest.getWilaya());
        user.setLicenseNumber(registrationRequest.getLicenseNumber());
        user.setIsActive(true);
        user.setIsVerified(false);
        
        // Set default role
        Set<String> roles = new HashSet<>();
        roles.add(USER_ROLE);
        user.setRoles(roles);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateTokenFromEmail(savedUser.getEmail());
        
        return new UserAuthenticationResponse(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            token,
            savedUser.getRoles(),
            savedUser.getIsVerified(),
            savedUser.getIsActive()
        );
    }
    
    /**
     * Authenticate user and return JWT token
     * @param loginRequest login credentials
     * @return UserAuthenticationResponse with JWT token
     */
    public UserAuthenticationResponse authenticateUser(@Valid UserLoginRequest loginRequest) {
        logger.info("Authenticating user with email: {}", loginRequest.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtil.generateJwtToken(authentication);
            
            User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            return new UserAuthenticationResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                token,
                user.getRoles(),
                user.getIsVerified(),
                user.getIsActive()
            );
            
        } catch (Exception e) {
            logger.error("Authentication failed for email: {}", loginRequest.getEmail(), e);
            throw new RuntimeException("Invalid email or password");
        }
    }
    
    /**
     * Get user profile by ID
     * @param userId user ID
     * @return User
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long userId) {
        logger.debug("Getting user by ID: {}", userId);
        return userRepository.findById(userId);
    }
    
    /**
     * Get user profile by email
     * @param email user email
     * @return Optional of User
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        logger.debug("Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }
    
    /**
     * Update user profile
     * @param userId user ID
     * @param updateRequest update data
     * @return Updated User
     */
    public User updateUser(Long userId, UserRegistrationRequest updateRequest) {
        logger.info("Updating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Update user fields
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }
        if (updateRequest.getAddress() != null) {
            user.setAddress(updateRequest.getAddress());
        }
        if (updateRequest.getCity() != null) {
            user.setCity(updateRequest.getCity());
        }
        if (updateRequest.getWilaya() != null) {
            user.setWilaya(updateRequest.getWilaya());
        }
        if (updateRequest.getLicenseNumber() != null) {
            // Check if new license number conflicts with existing users
            if (!updateRequest.getLicenseNumber().equals(user.getLicenseNumber()) &&
                userRepository.existsByLicenseNumber(updateRequest.getLicenseNumber())) {
                throw new RuntimeException("License number already exists: " + updateRequest.getLicenseNumber());
            }
            user.setLicenseNumber(updateRequest.getLicenseNumber());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Add role to user
     * @param userId user ID
     * @param role role to add
     * @return Updated User
     */
    public User addRoleToUser(Long userId, String role) {
        logger.info("Adding role {} to user {}", role, userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.addRole(role);
        return userRepository.save(user);
    }
    
    /**
     * Remove role from user
     * @param userId user ID
     * @param role role to remove
     * @return Updated User
     */
    public User removeRoleFromUser(Long userId, String role) {
        logger.info("Removing role {} from user {}", role, userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.removeRole(role);
        return userRepository.save(user);
    }
    
    /**
     * Verify user
     * @param userId user ID
     * @return Verified User
     */
    public User verifyUser(Long userId) {
        logger.info("Verifying user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setIsVerified(true);
        return userRepository.save(user);
    }
    
    /**
     * Deactivate user
     * @param userId user ID
     * @return Deactivated User
     */
    public User deactivateUser(Long userId) {
        logger.info("Deactivating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setIsActive(false);
        return userRepository.save(user);
    }
    
    /**
     * Activate user
     * @param userId user ID
     * @return Activated User
     */
    public User activateUser(Long userId) {
        logger.info("Activating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    /**
     * Search users
     * @param searchTerm search term
     * @param pageable pagination information
     * @return Page of Users
     */
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        logger.debug("Searching users with term: {}", searchTerm);
        return userRepository.searchUsers(searchTerm, pageable);
    }
    
    /**
     * Get verified users
     * @param pageable pagination information
     * @return Page of verified Users
     */
    @Transactional(readOnly = true)
    public Page<User> getVerifiedUsers(Pageable pageable) {
        logger.debug("Getting verified users");
        return userRepository.findVerifiedUsers(pageable);
    }
    
    /**
     * Get users by role
     * @param role role name
     * @param pageable pagination information
     * @return Page of Users
     */
    @Transactional(readOnly = true)
    public Page<User> getUsersByRole(String role, Pageable pageable) {
        logger.debug("Getting users by role: {}", role);
        return userRepository.findUsersByRole(role, pageable);
    }
}