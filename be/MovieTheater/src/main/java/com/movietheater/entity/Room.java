package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ROOMS")
@Data
public class Room {
    @Id
    @Column(name = "ROOM_ID")
    private String roomId;

    @Column(name = "ROOM_NAME", nullable = false)
    private String roomName;

    @Column(name = "CAPACITY", nullable = false)
    private Integer capacity;

    @Column(name = "DESCRIPTION")
    private String description;
}