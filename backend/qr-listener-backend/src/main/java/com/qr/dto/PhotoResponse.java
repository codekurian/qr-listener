package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
    private Long id;
    private String fileUrl;
    private String thumbnailUrl;
    private String fileName;
    private Boolean isCover;
    private Integer displayOrder;
}

