package com.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Entity
@Table(name = "publication_photos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl; // For backward compatibility, can store URL if migrating from S3 later

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "image_data", columnDefinition = "BYTEA")
    @Basic(fetch = FetchType.LAZY)
    private byte[] imageData; // Store image binary data in database

    @Column(name = "thumbnail_data", columnDefinition = "BYTEA")
    @Basic(fetch = FetchType.LAZY)
    private byte[] thumbnailData; // Store thumbnail binary data

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "is_cover")
    @Builder.Default
    private Boolean isCover = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

