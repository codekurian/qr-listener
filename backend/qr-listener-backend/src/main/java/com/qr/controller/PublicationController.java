package com.qr.controller;

import com.qr.dto.*;
import com.qr.service.PublicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publisher")
@RequiredArgsConstructor
@Slf4j
public class PublicationController {

    private final PublicationService publicationService;

    @PostMapping("/publications")
    public ResponseEntity<PublicationResponse> createPublication(
            @Valid @RequestBody PublicationRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "admin") String userId) {
        log.info("Creating publication: {}", request.getPrimaryNames());
        
        PublicationResponse response = publicationService.createPublication(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/publications")
    public ResponseEntity<PagedResponse<PublicationResponse>> getAllPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("GET /api/publisher/publications - page: {}, size: {}", page, size);
        
        PagedResponse<PublicationResponse> response = publicationService.getAllPublications(
                page, size, sortBy, sortDirection);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/publications/{id}")
    public ResponseEntity<PublicationResponse> getPublicationById(@PathVariable Long id) {
        log.info("GET /api/publisher/publications/{}", id);
        
        PublicationResponse response = publicationService.getPublicationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/publications/slug/{slug}")
    public ResponseEntity<PublicationResponse> getPublicationBySlug(@PathVariable String slug) {
        log.info("GET /api/publisher/publications/slug/{}", slug);
        
        PublicationResponse response = publicationService.getPublicationBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/publications/search")
    public ResponseEntity<PagedResponse<PublicationResponse>> searchPublications(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/publisher/publications/search - query: {}, status: {}", query, status);
        
        PagedResponse<PublicationResponse> response = publicationService.searchPublications(
                query, status, page, size);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/publications/{id}")
    public ResponseEntity<PublicationResponse> updatePublication(
            @PathVariable Long id,
            @Valid @RequestBody PublicationRequest request) {
        
        log.info("PUT /api/publisher/publications/{}", id);
        
        PublicationResponse response = publicationService.updatePublication(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/publications/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        log.info("DELETE /api/publisher/publications/{}", id);
        
        publicationService.deletePublication(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/publications/stats")
    public ResponseEntity<PublicationStatsResponse> getStats() {
        log.info("GET /api/publisher/publications/stats");
        
        PublicationStatsResponse response = publicationService.getStats();
        return ResponseEntity.ok(response);
    }
}

