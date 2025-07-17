package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    private String position;

    private Double salary;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}