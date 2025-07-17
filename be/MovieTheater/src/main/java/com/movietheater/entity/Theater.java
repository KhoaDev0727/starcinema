package com.movietheater.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "THEATERS")
public class Theater {
    @Id
    @Column(name = "THEATER_ID")
    private String theaterId;

    @Column(name = "THEATER_NAME")
    private String theaterName;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @ManyToOne
    @JoinColumn(name = "LOCATION_ID") 
    private Location location;
}