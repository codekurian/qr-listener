package com.qr.controller;

import com.qr.dto.*;
import com.qr.service.QrCodeManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class QrCodeManagementController {

    private final QrCodeManagementService qrCodeManagementService;

    @GetMapping("/qr-codes")
    public ResponseEntity<PagedResponse<QrCodeListResponse>> getAllQrCodes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("GET /api/admin/qr-codes - page: {}, size: {}, sortBy: {}, sortDirection: {}", 
                page, size, sortBy, sortDirection);
        
        PagedResponse<QrCodeListResponse> response = qrCodeManagementService.getAllQrCodes(
                page, size, sortBy, sortDirection);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/qr-codes/search")
    public ResponseEntity<PagedResponse<QrCodeListResponse>> searchQrCodes(
            @Valid @RequestBody QrCodeSearchRequest searchRequest) {
        
        log.info("POST /api/admin/qr-codes/search - request: {}", searchRequest);
        
        PagedResponse<QrCodeListResponse> response = qrCodeManagementService.searchQrCodes(searchRequest);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qr-codes/{id}")
    public ResponseEntity<QrCodeListResponse> getQrCodeById(@PathVariable Long id) {
        log.info("GET /api/admin/qr-codes/{}", id);
        
        QrCodeListResponse response = qrCodeManagementService.getQrCodeById(id);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qr-codes/qr-id/{qrId}")
    public ResponseEntity<QrCodeListResponse> getQrCodeByQrId(@PathVariable String qrId) {
        log.info("GET /api/admin/qr-codes/qr-id/{}", qrId);
        
        QrCodeListResponse response = qrCodeManagementService.getQrCodeByQrId(qrId);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/qr-codes/{id}")
    public ResponseEntity<QrCodeListResponse> updateQrCode(
            @PathVariable Long id,
            @Valid @RequestBody QrCodeUpdateRequest updateRequest) {
        
        log.info("PUT /api/admin/qr-codes/{} - request: {}", id, updateRequest);
        
        QrCodeListResponse response = qrCodeManagementService.updateQrCode(id, updateRequest);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/qr-codes/{id}")
    public ResponseEntity<Void> deleteQrCode(@PathVariable Long id) {
        log.info("DELETE /api/admin/qr-codes/{}", id);
        
        boolean deleted = qrCodeManagementService.deleteQrCode(id);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/qr-codes/recent")
    public ResponseEntity<List<QrCodeListResponse>> getRecentQrCodes(
            @RequestParam(defaultValue = "5") int limit) {
        
        log.info("GET /api/admin/qr-codes/recent - limit: {}", limit);
        
        List<QrCodeListResponse> response = qrCodeManagementService.getRecentQrCodes(limit);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qr-codes/stats")
    public ResponseEntity<QrCodeStatsResponse> getQrCodeStats() {
        log.info("GET /api/admin/qr-codes/stats");
        
        long totalQrCodes = qrCodeManagementService.getTotalQrCodesCount();
        
        QrCodeStatsResponse response = QrCodeStatsResponse.builder()
                .totalQrCodes(totalQrCodes)
                .activeQrCodes(totalQrCodes) // All are active since we filter by isActive = true
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("QR Code Management Service is healthy");
    }
}
