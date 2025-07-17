package com.movietheater.moviemanagement.service.impl;

import com.movietheater.moviemanagement.dto.request.MovieCreateRequest;
import com.movietheater.moviemanagement.dto.request.MovieUpdateRequest;
import com.movietheater.moviemanagement.dto.response.MovieResponse;
import com.movietheater.entity.Movie;
import com.movietheater.entity.MovieMedia;
import com.movietheater.repository.MovieRepository;
import com.movietheater.repository.MovieMediaRepository;
import com.movietheater.moviemanagement.service.MovieService;
import com.movietheater.common.constant.CommonConst;
import com.movietheater.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the MovieService interface for managing movies.
 */
@Service
public class MovieServiceImpl implements MovieService {
    private static final Logger logger = LoggerFactory.getLogger(MovieServiceImpl.class);
    private final MovieRepository movieRepository;
    private final MovieMediaRepository movieMediaRepository;

    public MovieServiceImpl(MovieRepository movieRepository, MovieMediaRepository movieMediaRepository) {
        this.movieRepository = movieRepository;
        this.movieMediaRepository = movieMediaRepository;
    }

    private String generateNextId(String prefix, String currentMax) {
        if (currentMax == null || currentMax.isEmpty()) {
            return prefix + "001";
        }
        int number = Integer.parseInt(currentMax.replace(prefix, ""));
        number++;
        return String.format("%s%03d", prefix, number);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies(String title, String genre, String releaseDate) {
        // Lấy tất cả phim không phân trang
        List<Movie> allMovies = movieRepository.findAllWithPosters();
        return allMovies.stream()
            .filter(m -> title == null || m.getTitle().toLowerCase().contains(title.toLowerCase()))
            .filter(m -> genre == null || (m.getGenre() != null && m.getGenre().toLowerCase().contains(genre.toLowerCase())))
            .filter(m -> {
                if (releaseDate == null) return true;
                if (m.getReleaseDate() == null) return false;
                return m.getReleaseDate().toString().equals(releaseDate);
            })
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Page<MovieResponse> getMovies(String title, String genre, String releaseDate, Pageable pageable) {
        // Hiện tại MovieRepository chưa có phương thức phân trang, nên sẽ lấy toàn bộ rồi phân trang thủ công
        List<Movie> allMovies = movieRepository.findAllWithPosters();
        List<Movie> filtered = allMovies.stream()
            .filter(m -> title == null || m.getTitle().toLowerCase().contains(title.toLowerCase()))
            .filter(m -> genre == null || (m.getGenre() != null && m.getGenre().toLowerCase().contains(genre.toLowerCase())))
            .filter(m -> {
                if (releaseDate == null) return true;
                if (m.getReleaseDate() == null) return false;
                return m.getReleaseDate().toString().equals(releaseDate);
            })
            .collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<MovieResponse> content = filtered.subList(start, end).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, filtered.size());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public MovieResponse createMovie(MovieCreateRequest request) {
        String maxMovieId = movieRepository.findMaxMovieId();
        String newMovieId = generateNextId("M", maxMovieId);
        Movie movie = new Movie();
        movie.setMovieId(newMovieId);
        movie.setTitle(request.getTitle());
        movie.setShortDescription(request.getShortDescription());
        movie.setDescription(request.getDescription());
        movie.setDirector(request.getDirector());
        movie.setActors(request.getActors());
        movie.setGenre(request.getGenre());
        if (request.getReleaseDate() != null) {
            movie.setReleaseDate(LocalDate.parse(request.getReleaseDate()));
        }
        movie.setDuration(request.getDuration());
        movie.setLanguage(request.getLanguage());
        movie.setRated(request.getRated());
        // Xử lý poster
        if (request.getPosterUrl() != null && !request.getPosterUrl().isEmpty()) {
            String maxMediaId = movieMediaRepository.findMaxMediaId();
            String newMediaId = generateNextId("MM", maxMediaId);
            MovieMedia media = new MovieMedia();
            media.setMediaId(newMediaId);
            media.setMovie(movie);
            media.setMediaType(CommonConst.MEDIA_TYPE_IMAGE);
            media.setMediaUrl(request.getPosterUrl());
            media.setDescription("Poster for " + request.getTitle());
            movie.setMovieMedia(List.of(media));
        }
        Movie savedMovie = movieRepository.save(movie);
        return toResponse(savedMovie);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public MovieResponse updateMovie(String movieId, MovieUpdateRequest request) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + movieId));
        if (request.getTitle() != null) movie.setTitle(request.getTitle());
        if (request.getShortDescription() != null) movie.setShortDescription(request.getShortDescription());
        if (request.getDescription() != null) movie.setDescription(request.getDescription());
        if (request.getDirector() != null) movie.setDirector(request.getDirector());
        if (request.getActors() != null) movie.setActors(request.getActors());
        if (request.getGenre() != null) movie.setGenre(request.getGenre());
        if (request.getReleaseDate() != null) movie.setReleaseDate(LocalDate.parse(request.getReleaseDate()));
        if (request.getDuration() != null) movie.setDuration(request.getDuration());
        if (request.getLanguage() != null) movie.setLanguage(request.getLanguage());
        if (request.getRated() != null) movie.setRated(request.getRated());
        // Xử lý poster
        if (request.getPosterUrl() != null) {
            if (!request.getPosterUrl().isEmpty()) {
                MovieMedia existingMedia = movie.getMovieMedia().stream()
                    .filter(media -> media.getMediaType().equals(CommonConst.MEDIA_TYPE_IMAGE))
                    .findFirst().orElse(null);
                if (existingMedia != null) {
                    existingMedia.setMediaUrl(request.getPosterUrl());
                    existingMedia.setDescription("Updated poster for " + movie.getTitle());
                } else {
                    String maxMediaId = movieMediaRepository.findMaxMediaId();
                    String newMediaId = generateNextId("MM", maxMediaId);
                    MovieMedia newMedia = new MovieMedia();
                    newMedia.setMediaId(newMediaId);
                    newMedia.setMovie(movie);
                    newMedia.setMediaType(CommonConst.MEDIA_TYPE_IMAGE);
                    newMedia.setMediaUrl(request.getPosterUrl());
                    newMedia.setDescription("Poster for " + movie.getTitle());
                    movie.getMovieMedia().add(newMedia);
                }
            } else {
                movie.getMovieMedia().removeIf(media -> media.getMediaType().equals(CommonConst.MEDIA_TYPE_IMAGE));
            }
        }
        Movie updatedMovie = movieRepository.save(movie);
        return toResponse(updatedMovie);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void deleteMovie(String movieId) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + movieId));
        movieRepository.delete(movie);
    }

    /**
     * Chuyển đổi Movie entity sang MovieResponse DTO.
     *
     * @param movie the movie entity
     * @return the movie response DTO
     */
    private MovieResponse toResponse(Movie movie) {
        MovieResponse dto = new MovieResponse();
        dto.setMovieId(movie.getMovieId());
        dto.setTitle(movie.getTitle());
        dto.setShortDescription(movie.getShortDescription());
        dto.setDescription(movie.getDescription());
        dto.setDirector(movie.getDirector());
        dto.setActors(movie.getActors());
        dto.setGenre(movie.getGenre());
        if (movie.getReleaseDate() != null) dto.setReleaseDate(movie.getReleaseDate().toString());
        dto.setDuration(movie.getDuration());
        dto.setLanguage(movie.getLanguage());
        dto.setRated(movie.getRated());
        // Lấy poster
        if (movie.getMovieMedia() != null && !movie.getMovieMedia().isEmpty()) {
            MovieMedia posterMedia = movie.getMovieMedia().stream()
                .filter(media -> CommonConst.MEDIA_TYPE_IMAGE.equals(media.getMediaType()) && media.getMediaUrl() != null)
                .findFirst().orElse(null);
            if (posterMedia != null) {
                dto.setPosterUrl(posterMedia.getMediaUrl());
            }
        }
        // Các trường mở rộng (nếu có)
        dto.setRatingLabel(null);
        dto.setRanking(null);
        dto.setLikes(null);
        return dto;
    }
}