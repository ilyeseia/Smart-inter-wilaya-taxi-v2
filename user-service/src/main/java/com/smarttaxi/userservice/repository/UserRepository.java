package com.smarttaxi.userservice.repository;

import com.smarttaxi.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email address
     * @param email email address
     * @return Optional of User
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if email exists
     * @param email email address
     * @return true if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if license number exists
     * @param licenseNumber license number
     * @return true if license number exists
     */
    boolean existsByLicenseNumber(String licenseNumber);
    
    /**
     * Find active users by city and wilaya
     * @param city city name
     * @param wilaya wilaya name
     * @param pageable pagination information
     * @return Page of Users
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.city = :city AND u.wilaya = :wilaya")
    Page<User> findActiveUsersByCityAndWilaya(@Param("city") String city, 
                                             @Param("wilaya") String wilaya, 
                                             Pageable pageable);
    
    /**
     * Find verified users
     * @param pageable pagination information
     * @return Page of Users
     */
    @Query("SELECT u FROM User u WHERE u.isVerified = true")
    Page<User> findVerifiedUsers(Pageable pageable);
    
    /**
     * Find users by role
     * @param role role name
     * @param pageable pagination information
     * @return Page of Users
     */
    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles")
    Page<User> findUsersByRole(@Param("role") String role, Pageable pageable);
    
    /**
     * Find users by license number
     * @param licenseNumber license number
     * @return Optional of User
     */
    Optional<User> findByLicenseNumber(String licenseNumber);
    
    /**
     * Search users by first name, last name, or email
     * @param searchTerm search term
     * @param pageable pagination information
     * @return Page of Users
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
}