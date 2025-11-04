package com.smarttaxi.userservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vehicles")
@EntityListeners(AuditingEntityListener.class)
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 20)
    @Column(name = "license_plate", unique = true)
    private String licensePlate;
    
    @NotBlank
    @Size(max = 100)
    private String make;
    
    @NotBlank
    @Size(max = 100)
    private String model;
    
    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;
    
    @Size(max = 50)
    @Column(name = "vehicle_type")
    private String vehicleType; // sedan, hatchback, suv, etc.
    
    @Size(max = 20)
    @Column(name = "color")
    private String color;
    
    @Column(name = "seats")
    private Integer seats = 4;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Size(max = 100)
    @Column(name = "insurance_number")
    private String insuranceNumber;
    
    @Column(name = "insurance_expiry")
    private LocalDateTime insuranceExpiry;
    
    @Size(max = 100)
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Column(name = "registration_expiry")
    private LocalDateTime registrationExpiry;
    
    @ManyToMany(mappedBy = "vehicles")
    private Set<User> users = new HashSet<>();
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Vehicle() {}
    
    public Vehicle(String licensePlate, String make, String model) {
        this.licensePlate = licensePlate;
        this.make = make;
        this.model = model;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getLicensePlate() {
        return licensePlate;
    }
    
    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }
    
    public String getMake() {
        return make;
    }
    
    public void setMake(String make) {
        this.make = make;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    public Integer getYearOfManufacture() {
        return yearOfManufacture;
    }
    
    public void setYearOfManufacture(Integer yearOfManufacture) {
        this.yearOfManufacture = yearOfManufacture;
    }
    
    public String getVehicleType() {
        return vehicleType;
    }
    
    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public Integer getSeats() {
        return seats;
    }
    
    public void setSeats(Integer seats) {
        this.seats = seats;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public String getInsuranceNumber() {
        return insuranceNumber;
    }
    
    public void setInsuranceNumber(String insuranceNumber) {
        this.insuranceNumber = insuranceNumber;
    }
    
    public LocalDateTime getInsuranceExpiry() {
        return insuranceExpiry;
    }
    
    public void setInsuranceExpiry(LocalDateTime insuranceExpiry) {
        this.insuranceExpiry = insuranceExpiry;
    }
    
    public String getRegistrationNumber() {
        return registrationNumber;
    }
    
    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }
    
    public LocalDateTime getRegistrationExpiry() {
        return registrationExpiry;
    }
    
    public void setRegistrationExpiry(LocalDateTime registrationExpiry) {
        this.registrationExpiry = registrationExpiry;
    }
    
    public Set<User> getUsers() {
        return users;
    }
    
    public void setUsers(Set<User> users) {
        this.users = users;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public void addUser(User user) {
        this.users.add(user);
        user.getVehicles().add(this);
    }
    
    public void removeUser(User user) {
        this.users.remove(user);
        user.getVehicles().remove(this);
    }
    
    @Override
    public String toString() {
        return "Vehicle{" +
                "id=" + id +
                ", licensePlate='" + licensePlate + '\'' +
                ", make='" + make + '\'' +
                ", model='" + model + '\'' +
                ", isActive=" + isActive +
                ", isVerified=" + isVerified +
                '}';
    }
}