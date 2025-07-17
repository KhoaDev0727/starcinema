package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

	@Id
	@Column(name = "ticket_id", length = 10)
	private String ticketId;

	@Column(name = "schedule_id", length = 10, nullable = false)
	private String scheduleId;

	@Column(name = "seat_id", length = 10, nullable = false)
	private String seatId;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "price", precision = 10, scale = 2)
	private BigDecimal price;

	@Column(name = "booking_date")
	private Timestamp bookingDate;

	@Column(name = "status", length = 20)
	private String status;

	@Column(name = "promotion_id", length = 10)
	private String promotionId;

	// Constructors
	public Ticket() {
	}

	public Ticket(String ticketId, String scheduleId, String seatId, Long userId,
			BigDecimal price, Timestamp bookingDate, String status, String promotionId) {
		this.ticketId = ticketId;
		this.scheduleId = scheduleId;
		this.seatId = seatId;
		this.userId = userId;
		this.price = price;
		this.bookingDate = bookingDate;
		this.status = status;
		this.promotionId = promotionId;
	}

	public String getTicketId() {
		return ticketId;
	}

	public void setTicketId(String ticketId) {
		this.ticketId = ticketId;
	}

	public String getScheduleId() {
		return scheduleId;
	}

	public void setScheduleId(String scheduleId) {
		this.scheduleId = scheduleId;
	}

	public String getSeatId() {
		return seatId;
	}

	public void setSeatId(String seatId) {
		this.seatId = seatId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public Timestamp getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(Timestamp bookingDate) {
		this.bookingDate = bookingDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getPromotionId() {
		return promotionId;
	}

	public void setPromotionId(String promotionId) {
		this.promotionId = promotionId;
	}

}
