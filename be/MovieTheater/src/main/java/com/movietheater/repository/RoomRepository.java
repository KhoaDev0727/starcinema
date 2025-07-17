package com.movietheater.repository;

import com.movietheater.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoomRepository extends JpaRepository<Room, String> {
    @Query("SELECT MAX(r.roomId) FROM Room r WHERE r.roomId LIKE 'R%'")
    String findMaxRoomId();
}