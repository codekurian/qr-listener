package com.qr.controller;

import com.qr.dto.QrGenerationRequest;
import com.qr.dto.QrGenerationResponse;
import com.qr.dto.QrCodeStyle;
import com.qr.service.QrCodeGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@Slf4j
public class QrGeneratorController {

    private final QrCodeGenerationService qrCodeGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<QrGenerationResponse> generateQrCode(@Valid @RequestBody QrGenerationRequest request) {
        log.info("QR code generation request: {}", request);
        
        QrGenerationResponse response = qrCodeGenerationService.generateQrCode(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{qrId}/image")
    public ResponseEntity<byte[]> getQrCodeImage(
            @PathVariable String qrId,
            @RequestParam(defaultValue = "256") int size,
            @RequestParam(defaultValue = "PNG") String format,
            @RequestParam(required = false) String foreground,
            @RequestParam(required = false) String background,
            @RequestParam(required = false) String logo
    ) {
        log.debug("QR code image request for ID: {} with size: {}", qrId, size);
        
        QrCodeStyle style = QrCodeStyle.builder()
            .size(size)
            .format(format)
            .foreground(foreground)
            .background(background)
            .logo(logo)
            .build();
        
        byte[] imageData = qrCodeGenerationService.generateQrCodeImage(qrId, style);
        
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .cacheControl(CacheControl.maxAge(Duration.ofHours(1)))
            .header("ETag", generateETag(qrId, style))
            .body(imageData);
    }

    @GetMapping("/{qrId}/download")
    public ResponseEntity<byte[]> downloadQrCode(
            @PathVariable String qrId,
            @RequestParam(defaultValue = "512") int size
    ) {
        log.debug("QR code download request for ID: {} with size: {}", qrId, size);
        
        QrCodeStyle style = QrCodeStyle.builder()
            .size(size)
            .format("PNG")
            .build();
        
        byte[] imageData = qrCodeGenerationService.generateQrCodeImage(qrId, style);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + qrId + ".png")
            .contentType(MediaType.IMAGE_PNG)
            .body(imageData);
    }

    @DeleteMapping("/{qrId}")
    public ResponseEntity<Void> deleteQrCode(@PathVariable String qrId) {
        log.info("QR code deletion request for ID: {}", qrId);
        
        boolean deleted = qrCodeGenerationService.deleteQrCode(qrId);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("QR Generation Service is healthy");
    }

    private String generateETag(String qrId, QrCodeStyle style) {
        return "\"" + qrId + "_" + style.hashCode() + "\"";
    }
}
