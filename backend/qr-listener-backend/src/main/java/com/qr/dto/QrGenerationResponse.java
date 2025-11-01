package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerationResponse {
    private Long id;
    private String qrId;
    private String targetUrl;
    private String description;
    private String imageUrl;
    private String downloadUrl;
    private LocalDateTime createdAt;
}
