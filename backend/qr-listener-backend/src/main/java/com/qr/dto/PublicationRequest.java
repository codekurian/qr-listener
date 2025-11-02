package com.qr.dto;

import com.qr.entity.Publication;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class PublicationRequest {

    @NotNull(message = "Content type is required")
    private Publication.ContentType contentType;

    @NotBlank(message = "Primary names are required")
    private String primaryNames;

    private LocalDateTime specialDate;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Story is required")
    private String story;

    private List<String> tags;

    private Publication.PublicationStatus status;

    private LocalDateTime scheduledFor;

    private List<PhotoRequest> photos;
}

