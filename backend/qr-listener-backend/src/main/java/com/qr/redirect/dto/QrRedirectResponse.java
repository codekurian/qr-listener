package com.qr.redirect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrRedirectResponse {
    private String qrId;
    private String targetUrl;
    private String description;
    private String applicationName;
    private LocalDateTime createdAt;
    private Boolean isActive;
}
