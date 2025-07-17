package com.movietheater.repository;

import com.movietheater.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    Employee findByUserId(Long userId);
    long count();
}