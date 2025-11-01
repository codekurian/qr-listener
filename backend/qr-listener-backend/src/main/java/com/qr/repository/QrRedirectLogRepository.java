package com.qr.repository;

import com.qr.entity.QrRedirectLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QrRedirectLogRepository extends JpaRepository<QrRedirectLog, Long> {

    long countByQrIdAndSuccessTrue(String qrId);

    long countBySuccessTrue();

    @Query("SELECT COUNT(l) FROM QrRedirectLog l WHERE l.qrId = :qrId AND l.success = true")
    long countSuccessfulRedirectsByQrId(@Param("qrId") String qrId);

    @Query("SELECT l FROM QrRedirectLog l WHERE l.qrId = :qrId ORDER BY l.redirectTime DESC")
    List<QrRedirectLog> findByQrIdOrderByRedirectTimeDesc(@Param("qrId") String qrId);

    @Query("SELECT l FROM QrRedirectLog l WHERE l.redirectTime >= :startTime AND l.redirectTime <= :endTime ORDER BY l.redirectTime DESC")
    List<QrRedirectLog> findByRedirectTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT l.qrId, COUNT(l) as redirectCount FROM QrRedirectLog l WHERE l.success = true GROUP BY l.qrId ORDER BY redirectCount DESC")
    List<Object[]> findTopRedirectedQrCodes();

    @Query("SELECT COUNT(l) FROM QrRedirectLog l WHERE l.success = true")
    long countTotalSuccessfulRedirects();

    @Query("SELECT COUNT(l) FROM QrRedirectLog l WHERE l.success = false")
    long countTotalFailedRedirects();
}
