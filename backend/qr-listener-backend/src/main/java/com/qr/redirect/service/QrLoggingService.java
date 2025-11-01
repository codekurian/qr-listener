package com.qr.redirect.service;

import com.qr.entity.QrRedirectLog;
import com.qr.repository.QrRedirectLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrLoggingService {

    private final QrRedirectLogRepository redirectLogRepository;

    @Transactional
    public void logRedirect(String qrId, String ipAddress, String userAgent, String targetUrl) {
        try {
            QrRedirectLog redirectLog = QrRedirectLog.builder()
                .qrId(qrId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .redirectTime(LocalDateTime.now())
                .targetUrl(targetUrl)
                .success(targetUrl != null)
                .build();
            
            redirectLogRepository.save(redirectLog);
            
            log.debug("Logged redirect for QR ID: {} from IP: {} - Success: {}", 
                qrId, ipAddress, targetUrl != null);
                
        } catch (Exception e) {
            log.error("Failed to log redirect for QR ID: {}", qrId, e);
            // Don't throw exception to avoid breaking the redirect flow
        }
    }

    public long getRedirectCount(String qrId) {
        return redirectLogRepository.countByQrIdAndSuccessTrue(qrId);
    }

    public long getTotalRedirects() {
        return redirectLogRepository.count();
    }
}
