package com.movietheater.theatermanagement.controller;

import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.exception.ResourceNotFoundException;
import com.movietheater.theatermanagement.dto.request.TheaterCreateRequest;
import com.movietheater.theatermanagement.dto.request.TheaterUpdateRequest;
import com.movietheater.theatermanagement.dto.response.TheaterResponse;
import com.movietheater.theatermanagement.dto.response.LocationItemDTO;
import com.movietheater.theatermanagement.service.TheaterManagementService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("")
public class TheaterManagementController {
    private static final Logger logger = LoggerFactory.getLogger(TheaterManagementController.class);
    private static final int DEFAULT_PAGE_SIZE = 5;
    private final TheaterManagementService theaterManagementService;

    public TheaterManagementController(TheaterManagementService theaterManagementService) {
        this.theaterManagementService = theaterManagementService;
    }

    /**
     * Lấy danh sách rạp với filter nâng cao và phân trang.
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.THEATERS)
    @RestApiErrorResponses(responses = {})
    public ResponseEntity<?> getTheaters(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "theaterName"));
        List<TheaterResponse> all = theaterManagementService.getTheaters(name, location);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), all.size());
        List<TheaterResponse> content = all.subList(start, end);
        Page<TheaterResponse> result = new PageImpl<>(content, pageable, all.size());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách location.
     */
    @GetMapping(RouteConst.LOCATIONS)
    public ResponseEntity<List<LocationItemDTO>> getAllLocations() {
        List<LocationItemDTO> locations = theaterManagementService.getAllLocationItems();
        return ResponseEntity.ok(locations);
    }

    /**
     * Test endpoint to verify controller is working.
     */
    @GetMapping("/api/test")
    public ResponseEntity<String> testEndpoint() {
        logger.info("Test endpoint called");
        return ResponseEntity.ok("Controller is working!");
    }

    /**
     * Lấy danh sách rạp theo locationId.
     */
    @GetMapping(RouteConst.THEATERS_LOCATION + "/{locationId}")
    public ResponseEntity<List<TheaterResponse>> getTheatersByLocationId(@PathVariable String locationId) {
        List<TheaterResponse> theaters = theaterManagementService.getTheatersByLocationId(locationId);
        return ResponseEntity.ok(theaters);
    }

    /**
     * Lấy lịch chiếu theo theaterId.
     */
    @GetMapping(RouteConst.SCHEDULES_THEATER + "/{theaterId}")
    public ResponseEntity<?> getSchedulesByTheaterId(@PathVariable String theaterId) {
        return ResponseEntity.ok(theaterManagementService.getSchedulesByTheaterId(theaterId));
    }

    /**
     * Tạo mới rạp.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PostMapping(RouteConst.THEATERS)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E4001",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        )
    })
    public ResponseEntity<?> createTheater(@Valid @RequestBody TheaterCreateRequest request) {
        TheaterResponse created = theaterManagementService.createTheater(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật rạp.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PutMapping(RouteConst.THEATERS + "/{theaterId}")
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Theater not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E4002",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        )
    })
    public ResponseEntity<?> updateTheater(
            @PathVariable String theaterId,
            @Valid @RequestBody TheaterUpdateRequest request) {
        TheaterResponse updated = theaterManagementService.updateTheater(theaterId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa rạp.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @DeleteMapping(RouteConst.THEATERS + "/{theaterId}")
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Theater not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        )
    })
    public ResponseEntity<?> deleteTheater(@PathVariable String theaterId) {
        theaterManagementService.deleteTheater(theaterId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xử lý lỗi validate dữ liệu đầu vào.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", "E4001");
        errorResponse.put("message", "Invalid request data");
        errorResponse.put("originMessage", errors.toString());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}