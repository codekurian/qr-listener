package com.qr.redirect.service;

import com.qr.redirect.dto.QrRedirectResponse;
import com.qr.entity.QrCode;
import com.qr.repository.QrCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrRedirectService {

    private final QrCodeRepository qrCodeRepository;
    private final QrLoggingService qrLoggingService;

    @Cacheable(value = "qrCodes", key = "#qrId")
    public String getRedirectUrl(String qrId) {
        log.debug("Looking up redirect URL for QR ID: {}", qrId);
        
        Optional<QrCode> qrCode = qrCodeRepository.findByQrIdAndIsActiveTrue(qrId);
        
        if (qrCode.isPresent()) {
            QrCode code = qrCode.get();
            log.info("Found QR code: {} -> {}", qrId, code.getTargetUrl());
            
            // Log the redirect event
            qrLoggingService.logRedirect(qrId, getClientIp(), "Unknown", code.getTargetUrl());
            
            return code.getTargetUrl();
        } else {
            log.warn("QR code not found or inactive: {}", qrId);
            return null;
        }
    }

    @Cacheable(value = "qrInfo", key = "#qrId")
    public QrRedirectResponse getQrInfo(String qrId) {
        log.debug("Getting QR info for ID: {}", qrId);
        
        Optional<QrCode> qrCode = qrCodeRepository.findByQrIdAndIsActiveTrue(qrId);
        
        if (qrCode.isPresent()) {
            QrCode code = qrCode.get();
            return QrRedirectResponse.builder()
                    .qrId(code.getQrId())
                    .targetUrl(code.getTargetUrl())
                    .description(code.getDescription())
                    .applicationName(code.getApplication() != null ? code.getApplication().getName() : null)
                    .createdAt(code.getCreatedAt())
                    .isActive(code.getIsActive())
                    .build();
        } else {
            log.warn("QR code not found: {}", qrId);
            return null;
        }
    }

    private String getClientIp() {
        // This would be implemented to get the actual client IP
        // For now, return a placeholder
        return "127.0.0.1";
    }
}
