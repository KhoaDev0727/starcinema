package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Score {

	@Id
	@Column(name = "score_id", length = 10)
	private String scoreId;

	@ManyToOne()
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE"))
	private User user;

	@ManyToOne()
	@JoinColumn(name = "ticket_id", nullable = true, foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE SET NULL"))
	private Ticket ticket;

	@Column(name = "points", nullable = false)
	private Integer points;

	@Column(name = "transaction_date", nullable = false)
	private LocalDateTime transactionDate;

	@Column(name = "type", length = 20, nullable = false)
	private String type; // "add" hoặc "use"
}
