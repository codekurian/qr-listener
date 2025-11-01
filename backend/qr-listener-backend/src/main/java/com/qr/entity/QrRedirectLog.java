package com.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_redirect_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrRedirectLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "qr_id", nullable = false, length = 100)
    private String qrId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "redirect_time", nullable = false, updatable = false)
    private LocalDateTime redirectTime;

    @Column(name = "target_url", length = 500)
    private String targetUrl;

    @Column(name = "success", nullable = false)
    @Builder.Default
    private Boolean success = true;
}
