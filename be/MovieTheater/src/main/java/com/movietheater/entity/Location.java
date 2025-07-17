package com.movietheater.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LOCATIONS")
@Data
@NoArgsConstructor
public class Location {
    @Id
    @Column(name = "LOCATION_ID")
    private String locationId;

    @Column(name = "LOCATION_NAME")
    private String locationName;
}