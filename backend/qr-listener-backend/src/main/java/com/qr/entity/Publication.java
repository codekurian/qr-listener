package com.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "publications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Publication.ContentType contentType;

    @Column(name = "primary_names", nullable = false, length = 200)
    private String primaryNames;

    @Column(name = "special_date")
    private LocalDateTime specialDate;

    @Column(name = "slug", unique = true, nullable = false, length = 200)
    private String slug;

    @Column(name = "story", columnDefinition = "TEXT")
    private String story;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // Comma-separated tags

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Publication.PublicationStatus status = Publication.PublicationStatus.DRAFT;

    @Column(name = "scheduled_for")
    private LocalDateTime scheduledFor;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PublicationPhoto> photos = new ArrayList<>();

    public enum ContentType {
        SINGLE_PERSON, COUPLE, FAMILY
    }

    public enum PublicationStatus {
        DRAFT, PUBLISHED, SCHEDULED
    }
}

