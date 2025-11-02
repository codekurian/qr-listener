package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoRequest {
    private String fileUrl; // Base64 data URL or actual URL
    private String thumbnailUrl; // Base64 data URL or actual URL
    private String fileName;
    private Boolean isCover;
    private Integer displayOrder;
}

