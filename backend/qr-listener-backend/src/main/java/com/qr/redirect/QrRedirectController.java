package com.qr.redirect;

import com.qr.redirect.dto.QrRedirectResponse;
import com.qr.redirect.service.QrRedirectService;
import com.qr.redirect.service.QrLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@Slf4j
@Validated
public class QrRedirectController {

    private final QrRedirectService qrRedirectService;
    private final QrLoggingService qrLoggingService;
    private final HttpServletRequest request;

    @GetMapping("/redirect")
    public ResponseEntity<Void> redirectQr(
            @RequestParam 
            @NotBlank 
            @Pattern(regexp = "^[A-Z]{2,10}-[A-Z0-9]{8}$", message = "Invalid QR ID format") 
            String qr_id) {
        
        log.info("QR redirect request for ID: {} from IP: {}", qr_id, getClientIp());
        
        // Look up redirect URL
        String targetUrl = qrRedirectService.getRedirectUrl(qr_id);
        
        if (targetUrl != null) {
            // Log redirect event
            qrLoggingService.logRedirect(qr_id, getClientIp(), getUserAgent(), targetUrl);
            
            log.info("Redirecting QR {} to: {}", qr_id, targetUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", targetUrl)
                    .build();
        } else {
            // Log failed redirect
            qrLoggingService.logRedirect(qr_id, getClientIp(), getUserAgent(), null);
            
            log.warn("QR code not found or inactive: {}", qr_id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/info")
    public ResponseEntity<QrRedirectResponse> getQrInfo(@RequestParam @NotBlank String qr_id) {
        log.info("QR info request for ID: {}", qr_id);
        
        QrRedirectResponse response = qrRedirectService.getQrInfo(qr_id);
        
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/redirect/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("QR Redirect Service is healthy");
    }

    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getUserAgent() {
        return request.getHeader("User-Agent");
    }
}
