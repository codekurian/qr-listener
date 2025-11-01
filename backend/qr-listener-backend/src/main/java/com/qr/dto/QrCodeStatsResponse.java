package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeStatsResponse {
    private long totalQrCodes;
    private long activeQrCodes;
    private long inactiveQrCodes;
    private long totalScans;
    private long uniqueScans;
}
