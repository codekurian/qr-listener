package com.qr.dto;

import com.qr.entity.Publication;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationResponse {
    private Long id;
    private Publication.ContentType contentType;
    private String primaryNames;
    private LocalDateTime specialDate;
    private String slug;
    private String story;
    private List<String> tags;
    private Publication.PublicationStatus status;
    private LocalDateTime scheduledFor;
    private Long viewCount;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private List<PhotoResponse> photos;
}

