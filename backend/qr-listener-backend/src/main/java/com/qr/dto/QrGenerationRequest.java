package com.qr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerationRequest {
    
    @NotBlank(message = "Target URL is required")
    @Size(max = 500, message = "Target URL must not exceed 500 characters")
    private String targetUrl;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 20, message = "Prefix must not exceed 20 characters")
    private String prefix;
    
    @NotNull(message = "Size is required")
    private Integer size = 256;
    
    @NotBlank(message = "Created by is required")
    @Size(max = 100, message = "Created by must not exceed 100 characters")
    private String createdBy;
    
    private Long applicationId;
}
