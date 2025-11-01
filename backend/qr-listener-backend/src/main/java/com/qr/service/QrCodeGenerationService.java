package com.qr.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.qr.dto.QrGenerationRequest;
import com.qr.dto.QrGenerationResponse;
import com.qr.dto.QrCodeStyle;
import com.qr.entity.QrCode;
import com.qr.repository.QrCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrCodeGenerationService {

    private final QrCodeRepository qrCodeRepository;
    
    @Value("${qr.redirect.base-url:http://graceshoppee.tech:8080}")
    private String redirectBaseUrl;

    @Transactional
    public QrGenerationResponse generateQrCode(QrGenerationRequest request) {
        log.info("Generating QR code for request: {}", request);
        
        // Generate unique QR ID
        String qrId = generateUniqueQrId(request.getPrefix());
        
        // Save QR code mapping to database (NO IMAGE STORAGE)
        QrCode qrCode = QrCode.builder()
            .qrId(qrId)
            .targetUrl(request.getTargetUrl())
            .description(request.getDescription())
            .createdBy(request.getCreatedBy())
            .isActive(true)
            .createdAt(LocalDateTime.now())
            .build();
        
        QrCode savedQrCode = qrCodeRepository.save(qrCode);
        
        log.info("Successfully generated QR code: {} -> {}", qrId, request.getTargetUrl());
        
        return QrGenerationResponse.builder()
            .id(savedQrCode.getId())
            .qrId(qrId)
            .targetUrl(request.getTargetUrl())
            .description(request.getDescription())
            .imageUrl("/api/qr/" + qrId + "/image")  // On-the-fly generation URL
            .downloadUrl("/api/qr/" + qrId + "/download")
            .createdAt(savedQrCode.getCreatedAt())
            .build();
    }

    @Cacheable(value = "qrCodes", key = "#qrId + '_' + #style.hashCode()")
    public byte[] generateQrCodeImage(String qrId, QrCodeStyle style) {
        log.debug("Generating QR code image for ID: {} with style: {}", qrId, style);
        
        // Verify QR code exists in database
        QrCode qrCode = qrCodeRepository.findByQrIdAndIsActiveTrue(qrId)
            .orElseThrow(() -> new RuntimeException("QR code not found: " + qrId));
        
        // Generate QR code image on-the-fly
        return createQrCodeImage(qrCode.getQrId(), style);
    }

    public String getQrCodeImageUrl(String qrId, QrCodeStyle style) {
        return String.format("/api/qr/%s/image?size=%d&format=%s", 
            qrId, style.getSize(), style.getFormat());
    }

    @Transactional
    public boolean deleteQrCode(String qrId) {
        log.info("Deleting QR code: {}", qrId);
        
        // Find QR code in database
        QrCode qrCode = qrCodeRepository.findByQrIdAndIsActiveTrue(qrId)
            .orElse(null);
        
        if (qrCode == null) {
            log.warn("QR code not found: {}", qrId);
            return false;
        }
        
        // Mark as inactive in database (NO FILE DELETION NEEDED)
        qrCode.setIsActive(false);
        qrCodeRepository.save(qrCode);
        
        log.info("Successfully deleted QR code: {}", qrId);
        return true;
    }

    private String generateUniqueQrId(String prefix) {
        String qrId;
        int attempts = 0;
        int maxAttempts = 10;
        
        do {
            String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            qrId = (prefix != null ? prefix + "-" : "") + suffix;
            attempts++;
        } while (qrCodeRepository.existsByQrId(qrId) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            throw new RuntimeException("Failed to generate unique QR ID after " + maxAttempts + " attempts");
        }
        
        return qrId;
    }

    private byte[] createQrCodeImage(String qrId, QrCodeStyle style) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            
            // Build the full redirect URL for the QR code
            // Format: {base-url}/api/qr/redirect?qr_id={qrId}
            String redirectUrl = buildRedirectUrl(qrId);
            
            // The QR code contains the full redirect URL so scanners can redirect properly
            BitMatrix bitMatrix = qrCodeWriter.encode(
                redirectUrl,             // ← Full redirect URL goes in the QR code
                BarcodeFormat.QR_CODE, 
                style.getSize(), 
                style.getSize()
            );
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, style.getFormat(), outputStream);
            
            log.debug("Generated QR code image for ID: {} (content: '{}')", qrId, redirectUrl);
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Failed to create QR code image for ID: {}", qrId, e);
            throw new RuntimeException("Failed to create QR code image", e);
        }
    }
    
    private String buildRedirectUrl(String qrId) {
        // Get base URL from Spring configuration
        String baseUrl = redirectBaseUrl;
        
        // Ensure base URL doesn't end with a slash
        if (baseUrl != null && baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        
        return String.format("%s/api/qr/redirect?qr_id=%s", baseUrl, qrId);
    }
}
