package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationStatsResponse {
    private Long totalPublications;
    private Long published;
    private Long drafts;
    private Long scheduled;
    private Long totalViews;
}

