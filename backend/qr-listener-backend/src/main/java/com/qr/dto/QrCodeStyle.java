package com.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeStyle {
    
    @Builder.Default
    private Integer size = 256;
    
    @Builder.Default
    private String format = "PNG";
    
    @Builder.Default
    private String errorCorrection = "M";
    
    @Builder.Default
    private Integer margin = 4;
    
    private String foreground;
    private String background;
    private String logo;
    private Integer logoSize;
    
    // Default styling
    public static QrCodeStyle defaultStyle() {
        return QrCodeStyle.builder()
            .size(256)
            .format("PNG")
            .errorCorrection("M")
            .margin(4)
            .foreground("#000000")
            .background("#FFFFFF")
            .build();
    }
    
    // Small size for mobile
    public static QrCodeStyle small() {
        return QrCodeStyle.builder()
            .size(128)
            .format("PNG")
            .errorCorrection("M")
            .margin(4)
            .foreground("#000000")
            .background("#FFFFFF")
            .build();
    }
    
    // Large size for print
    public static QrCodeStyle large() {
        return QrCodeStyle.builder()
            .size(512)
            .format("PNG")
            .errorCorrection("H")
            .margin(8)
            .foreground("#000000")
            .background("#FFFFFF")
            .build();
    }
    
    // High contrast for accessibility
    public static QrCodeStyle highContrast() {
        return QrCodeStyle.builder()
            .size(256)
            .format("PNG")
            .errorCorrection("H")
            .margin(4)
            .foreground("#000000")
            .background("#FFFFFF")
            .build();
    }
}
