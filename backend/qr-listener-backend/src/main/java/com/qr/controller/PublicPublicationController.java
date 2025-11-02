package com.qr.controller;

import com.qr.dto.PublicationResponse;
import com.qr.service.PublicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicPublicationController {

    private final PublicationService publicationService;

    @GetMapping("/publications/{slug}")
    public ResponseEntity<PublicationResponse> getPublicationBySlug(@PathVariable String slug) {
        log.info("GET /api/public/publications/{}", slug);
        
        PublicationResponse response = publicationService.getPublicationBySlug(slug);
        return ResponseEntity.ok(response);
    }
}

