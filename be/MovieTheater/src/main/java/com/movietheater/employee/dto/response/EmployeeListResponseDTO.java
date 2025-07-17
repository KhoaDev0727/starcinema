package com.movietheater.employee.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for employee list responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeListResponseDTO {
    private List<EmployeeResponseDTO> employees;
    private long totalCount;
    private int pageNumber;
    private int pageSize;
} 