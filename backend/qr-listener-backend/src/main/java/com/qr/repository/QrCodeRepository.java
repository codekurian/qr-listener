package com.qr.repository;

import com.qr.entity.QrCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    Optional<QrCode> findByQrIdAndIsActiveTrue(String qrId);

    List<QrCode> findByIsActiveTrueOrderByCreatedAtDesc();
    
    Page<QrCode> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT q FROM QrCode q WHERE q.isActive = true AND " +
           "(LOWER(q.qrId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<QrCode> searchActiveQrCodes(@Param("search") String search);
    
    @Query("SELECT q FROM QrCode q WHERE q.isActive = true AND " +
           "(LOWER(q.qrId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<QrCode> searchActiveQrCodes(@Param("search") String search, Pageable pageable);

    @Query("SELECT q FROM QrCode q WHERE q.isActive = true AND (q.application.id = :applicationId OR (q.application IS NULL AND :applicationId IS NULL))")
    List<QrCode> findByApplicationIdAndIsActiveTrue(@Param("applicationId") Long applicationId);
    
    Page<QrCode> findByCreatedByAndIsActiveTrue(String createdBy, Pageable pageable);

    boolean existsByQrId(String qrId);

    @Query("SELECT COUNT(q) FROM QrCode q WHERE q.isActive = true")
    long countActiveQrCodes();
}
