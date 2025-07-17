package com.movietheater.moviemanagement.controller;

import com.movietheater.common.annotation.RestApiErrorResponse;
import com.movietheater.common.annotation.RestApiErrorResponses;
import com.movietheater.common.constant.RouteConst;
import com.movietheater.common.constant.AuthorityConst;
import com.movietheater.common.constant.MessageConst;
import com.movietheater.common.exception.ResourceNotFoundException;
import com.movietheater.moviemanagement.dto.request.MovieCreateRequest;
import com.movietheater.moviemanagement.dto.request.MovieUpdateRequest;
import com.movietheater.moviemanagement.dto.response.MovieResponse;
import com.movietheater.moviemanagement.service.MovieService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
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
@RequestMapping(RouteConst.ADMIN_BASE)
public class MovieManagementController {
    private static final Logger logger = LoggerFactory.getLogger(MovieManagementController.class);
    private static final int DEFAULT_PAGE_SIZE = 5;
    private final MovieService movieService;

    public MovieManagementController(MovieService movieService) {
        this.movieService = movieService;
    }

    /**
     * Lấy danh sách phim với filter nâng cao và phân trang.
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @GetMapping(RouteConst.MOVIE)
    @RestApiErrorResponses(responses = {})
    public ResponseEntity<?> getMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String releaseDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "false") boolean all) {
        
        if (all) {
            // Lấy tất cả phim không phân trang
            List<MovieResponse> allMovies = movieService.getAllMovies(title, genre, releaseDate);
            return ResponseEntity.ok(allMovies);
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "releaseDate"));
        Page<MovieResponse> movies = movieService.getMovies(title, genre, releaseDate, pageable);
        return ResponseEntity.ok(movies != null ? movies : Page.empty(pageable));
    }

    /**
     * Tạo mới phim.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PostMapping(RouteConst.MOVIE)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E3001",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        )
    })
    public ResponseEntity<?> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        MovieResponse createdMovie = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMovie);
    }

    /**
     * Cập nhật phim.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @PutMapping(RouteConst.MOVIE + RouteConst.API_PARAM_MOVIE_ID_PATH)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Movie not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        ),
        @RestApiErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Invalid request data",
            code = "E3002",
            on = @RestApiErrorResponse.Exception(MethodArgumentNotValidException.class)
        )
    })
    public ResponseEntity<?> updateMovie(
            @PathVariable String movieId,
            @Valid @RequestBody MovieUpdateRequest request) {
        MovieResponse updatedMovie = movieService.updateMovie(movieId, request);
        return ResponseEntity.ok(updatedMovie);
    }

    /**
     * Xóa phim.
     */
    @PreAuthorize(AuthorityConst.AUTH_ROLE_ADMIN)
    @DeleteMapping(RouteConst.MOVIE + RouteConst.API_PARAM_MOVIE_ID_PATH)
    @RestApiErrorResponses(responses = {
        @RestApiErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = "Movie not found",
            code = MessageConst.ERROR_ENTITY_NOT_FOUND,
            on = @RestApiErrorResponse.Exception(ResourceNotFoundException.class)
        )
    })
    public ResponseEntity<?> deleteMovie(@PathVariable String movieId) {
        movieService.deleteMovie(movieId);
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
        errorResponse.put("code", "E3001");
        errorResponse.put("message", "Invalid request data");
        errorResponse.put("originMessage", errors.toString());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}