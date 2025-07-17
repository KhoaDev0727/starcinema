package com.movietheater.score.dto;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScoreHistoryDTO {
	private String scoreId;
    private Long userId;
    private String ticketId;
    private int points;
    private LocalDateTime transactionDate;
    private String type;
}
