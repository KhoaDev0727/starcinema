package com.movietheater.admin;

import com.movietheater.repository.UserRepository;
import com.movietheater.repository.PromotionRepository;
import com.movietheater.repository.MovieRepository;
import com.movietheater.repository.EmployeeRepository;
import com.movietheater.repository.ScheduleRepository;
import com.movietheater.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PromotionRepository promotionRepository;
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private ScheduleRepository scheduleRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("")
    public Map<String, Long> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("userCount", userRepository.count());
        stats.put("promotionCount", promotionRepository.count());
        stats.put("movieCount", movieRepository.count());
        stats.put("employeeCount", employeeRepository.count());
        stats.put("scheduleCount", scheduleRepository.count());
        // Tổng số vé đã bán (status = PAID)
        stats.put("ticketsSold", bookingRepository.countByStatus("PAID"));
        // Số suất chiếu hôm nay
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        stats.put("schedulesToday", scheduleRepository.countByShowtimeBetween(startOfDay, endOfDay));
        // Số khuyến mãi đang hoạt động
        LocalDateTime now = LocalDateTime.now();
        stats.put("activePromotions", promotionRepository.countByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(now, now));
        // TODO: Số user mới trong tháng (cần trường ngày tạo user)
        return stats;
    }
} 