package com.qr.service;

import com.qr.dto.*;
import com.qr.entity.Publication;
import com.qr.entity.PublicationPhoto;
import com.qr.repository.PublicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicationService {

    private final PublicationRepository publicationRepository;

    @Transactional
    public PublicationResponse createPublication(PublicationRequest request, String createdBy) {
        log.info("Creating publication: {}", request.getPrimaryNames());

        Publication publication = Publication.builder()
                .contentType(request.getContentType())
                .primaryNames(request.getPrimaryNames())
                .specialDate(request.getSpecialDate())
                .slug(request.getSlug())
                .story(request.getStory())
                .tags(request.getTags() != null ? String.join(",", request.getTags()) : null)
                .status(request.getStatus() != null ? request.getStatus() : Publication.PublicationStatus.DRAFT)
                .scheduledFor(request.getScheduledFor())
                .createdBy(createdBy)
                .viewCount(0L)
                .build();

        if (publication.getStatus() == Publication.PublicationStatus.PUBLISHED) {
            publication.setPublishedAt(LocalDateTime.now());
        }

        // Save photos - convert base64 data URLs to binary data and store in DB
        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            List<PublicationPhoto> photos = request.getPhotos().stream()
                    .map(photoRequest -> {
                        byte[] imageData = null;
                        byte[] thumbnailData = null;
                        String fileUrl = photoRequest.getFileUrl();
                        String thumbnailUrl = photoRequest.getThumbnailUrl();
                        
                        // Convert base64 data URL to binary data
                        if (fileUrl != null && fileUrl.startsWith("data:image")) {
                            try {
                                String base64Data = fileUrl.split(",")[1];
                                imageData = Base64.getDecoder().decode(base64Data);
                                // Store the base64 URL as well for backward compatibility
                            } catch (Exception e) {
                                log.warn("Failed to decode image data for photo: {}", photoRequest.getFileName(), e);
                            }
                        }
                        
                        // Convert thumbnail base64 data URL to binary data
                        if (thumbnailUrl != null && thumbnailUrl.startsWith("data:image")) {
                            try {
                                String base64Data = thumbnailUrl.split(",")[1];
                                thumbnailData = Base64.getDecoder().decode(base64Data);
                            } catch (Exception e) {
                                log.warn("Failed to decode thumbnail data for photo: {}", photoRequest.getFileName(), e);
                                // Fallback: use same image data for thumbnail if available
                                thumbnailData = imageData;
                            }
                        } else if (imageData != null) {
                            // If no thumbnail URL provided, use the same image data
                            thumbnailData = imageData;
                        }
                        
                        return PublicationPhoto.builder()
                                .publication(publication)
                                .fileUrl(fileUrl) // Keep URL for reference (base64 data URL)
                                .thumbnailUrl(thumbnailUrl) // Keep URL for reference
                                .imageData(imageData) // Store binary data in DB
                                .thumbnailData(thumbnailData) // Store thumbnail binary data in DB
                                .fileName(photoRequest.getFileName())
                                .isCover(photoRequest.getIsCover() != null ? photoRequest.getIsCover() : false)
                                .displayOrder(photoRequest.getDisplayOrder() != null ? photoRequest.getDisplayOrder() : 0)
                                .build();
                    })
                    .collect(Collectors.toList());
            publication.setPhotos(photos);
        }

        Publication saved = publicationRepository.save(publication);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PublicationResponse getPublicationBySlug(String slug) {
        Publication publication = publicationRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Publication not found: " + slug));
        
        // Increment view count
        publication.setViewCount(publication.getViewCount() + 1);
        publicationRepository.save(publication);
        
        return toResponse(publication);
    }

    @Transactional(readOnly = true)
    public PublicationResponse getPublicationById(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found: " + id));
        return toResponse(publication);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PublicationResponse> getAllPublications(int page, int size, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Publication> publications = publicationRepository.findAll(pageable);
        
        List<PublicationResponse> content = publications.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<PublicationResponse>builder()
                .content(content)
                .page(publications.getNumber())
                .size(publications.getSize())
                .totalElements(publications.getTotalElements())
                .totalPages(publications.getTotalPages())
                .first(publications.isFirst())
                .last(publications.isLast())
                .hasNext(publications.hasNext())
                .hasPrevious(publications.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<PublicationResponse> searchPublications(String query, String status, int page, int size) {
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Publication> publications;
        if (status != null && !status.equals("ALL")) {
            Publication.PublicationStatus pubStatus = Publication.PublicationStatus.valueOf(status);
            publications = publicationRepository.searchPublicationsByStatus(query, pubStatus, pageable);
        } else {
            publications = publicationRepository.searchPublications(query, pageable);
        }
        
        List<PublicationResponse> content = publications.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<PublicationResponse>builder()
                .content(content)
                .page(publications.getNumber())
                .size(publications.getSize())
                .totalElements(publications.getTotalElements())
                .totalPages(publications.getTotalPages())
                .first(publications.isFirst())
                .last(publications.isLast())
                .hasNext(publications.hasNext())
                .hasPrevious(publications.hasPrevious())
                .build();
    }

    @Transactional
    public PublicationResponse updatePublication(Long id, PublicationRequest request) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found: " + id));

        publication.setContentType(request.getContentType());
        publication.setPrimaryNames(request.getPrimaryNames());
        publication.setSpecialDate(request.getSpecialDate());
        publication.setSlug(request.getSlug());
        publication.setStory(request.getStory());
        publication.setTags(request.getTags() != null ? String.join(",", request.getTags()) : null);
        
        // Handle status update
        if (request.getStatus() != null) {
            Publication.PublicationStatus newStatus = request.getStatus();
            publication.setStatus(newStatus);
            
            // Set publishedAt when status changes to PUBLISHED
            if (newStatus == Publication.PublicationStatus.PUBLISHED && publication.getPublishedAt() == null) {
                publication.setPublishedAt(LocalDateTime.now());
                log.info("Setting publishedAt for publication ID: {}", id);
            }
        }
        
        publication.setScheduledFor(request.getScheduledFor());

        // Update photos - handle both existing photos (API URLs) and new photos (base64)
        if (request.getPhotos() != null) {
            // Get the managed collection (don't create a new one!)
            List<PublicationPhoto> existingPhotos = publication.getPhotos();
            if (existingPhotos == null) {
                existingPhotos = new java.util.ArrayList<>();
            }
            
            // Create a map of existing photos by ID for quick lookup
            java.util.Map<Long, PublicationPhoto> existingPhotosMap = existingPhotos.stream()
                    .filter(p -> p.getId() != null)
                    .collect(Collectors.toMap(PublicationPhoto::getId, p -> p));
            
            // Track which photos we've processed
            java.util.Set<Long> processedPhotoIds = new java.util.HashSet<>();
            
            // Process each photo request
            for (PhotoRequest photoRequest : request.getPhotos()) {
                String fileUrl = photoRequest.getFileUrl();
                String thumbnailUrl = photoRequest.getThumbnailUrl();
                
                // Check if this is an existing photo (API endpoint URL)
                Long photoId = extractPhotoIdFromUrl(fileUrl);
                
                // If we found a photo ID and it exists, reuse it
                if (photoId != null && existingPhotosMap.containsKey(photoId)) {
                    PublicationPhoto existingPhoto = existingPhotosMap.get(photoId);
                    // Update metadata
                    existingPhoto.setFileName(photoRequest.getFileName());
                    existingPhoto.setIsCover(photoRequest.getIsCover() != null ? photoRequest.getIsCover() : false);
                    existingPhoto.setDisplayOrder(photoRequest.getDisplayOrder() != null ? photoRequest.getDisplayOrder() : 0);
                    existingPhoto.setFileUrl(fileUrl);
                    existingPhoto.setThumbnailUrl(thumbnailUrl != null ? thumbnailUrl : fileUrl);
                    processedPhotoIds.add(photoId);
                } else {
                    // New photo - convert base64 data URL to binary data
                    byte[] imageData = null;
                    byte[] thumbnailData = null;
                    
                    // Convert base64 data URL to binary data
                    if (fileUrl != null && fileUrl.startsWith("data:image")) {
                        try {
                            String base64Data = fileUrl.split(",")[1];
                            imageData = Base64.getDecoder().decode(base64Data);
                        } catch (Exception e) {
                            log.warn("Failed to decode image data for photo: {}", photoRequest.getFileName(), e);
                        }
                    }
                    
                    // Convert thumbnail base64 data URL to binary data
                    if (thumbnailUrl != null && thumbnailUrl.startsWith("data:image")) {
                        try {
                            String base64Data = thumbnailUrl.split(",")[1];
                            thumbnailData = Base64.getDecoder().decode(base64Data);
                        } catch (Exception e) {
                            log.warn("Failed to decode thumbnail data for photo: {}", photoRequest.getFileName(), e);
                            thumbnailData = imageData;
                        }
                    } else if (imageData != null) {
                        thumbnailData = imageData;
                    }
                    
                    // Create new photo and add to collection
                    PublicationPhoto newPhoto = PublicationPhoto.builder()
                            .publication(publication)
                            .fileUrl(fileUrl)
                            .thumbnailUrl(thumbnailUrl)
                            .imageData(imageData)
                            .thumbnailData(thumbnailData)
                            .fileName(photoRequest.getFileName())
                            .isCover(photoRequest.getIsCover() != null ? photoRequest.getIsCover() : false)
                            .displayOrder(photoRequest.getDisplayOrder() != null ? photoRequest.getDisplayOrder() : 0)
                            .build();
                    
                    existingPhotos.add(newPhoto);
                }
            }
            
            // Remove photos that were not in the request (orphan removal)
            existingPhotos.removeIf(p -> p.getId() != null && !processedPhotoIds.contains(p.getId()));
        }

        Publication saved = publicationRepository.save(publication);
        return toResponse(saved);
    }

    @Transactional
    public void deletePublication(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found: " + id));
        publicationRepository.delete(publication);
    }

    /**
     * Extract photo ID from API endpoint URL
     * Handles formats like:
     * - "/api/publications/photos/8/image"
     * - "http://graceshoppee.tech:8080/api/publications/photos/8/image"
     * - "http://graceshoppee.tech/api/publications/photos/8/thumbnail"
     */
    private Long extractPhotoIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // Pattern: /api/publications/photos/{id}/image or /api/publications/photos/{id}/thumbnail
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("/api/publications/photos/(\\d+)/(?:image|thumbnail)");
        java.util.regex.Matcher matcher = pattern.matcher(url);
        
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException e) {
                log.warn("Failed to parse photo ID from URL: {}", url, e);
                return null;
            }
        }
        
        return null;
    }

    @Transactional(readOnly = true)
    public PublicationStatsResponse getStats() {
        Long total = publicationRepository.count();
        Long published = publicationRepository.countByStatus(Publication.PublicationStatus.PUBLISHED);
        Long drafts = publicationRepository.countByStatus(Publication.PublicationStatus.DRAFT);
        Long scheduled = publicationRepository.countByStatus(Publication.PublicationStatus.SCHEDULED);
        Long totalViews = publicationRepository.getTotalViewCount() != null 
                ? publicationRepository.getTotalViewCount() : 0L;

        return PublicationStatsResponse.builder()
                .totalPublications(total)
                .published(published)
                .drafts(drafts)
                .scheduled(scheduled)
                .totalViews(totalViews)
                .build();
    }

    private PublicationResponse toResponse(Publication publication) {
        List<String> tags = publication.getTags() != null && !publication.getTags().isEmpty()
                ? List.of(publication.getTags().split(","))
                : List.of();

        List<PhotoResponse> photos = publication.getPhotos() != null
                ? publication.getPhotos().stream()
                        .sorted((a, b) -> Integer.compare(
                                a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                                b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                        .map(photo -> {
                            // Return photo URL pointing to the photo endpoint if binary data exists
                            // Use full API path - frontend can use this directly
                            String photoUrl = photo.getImageData() != null && photo.getImageData().length > 0
                                    ? "/api/publications/photos/" + photo.getId() + "/image"
                                    : (photo.getFileUrl() != null ? photo.getFileUrl() : "");
                            
                            String thumbUrl = photo.getThumbnailData() != null && photo.getThumbnailData().length > 0
                                    ? "/api/publications/photos/" + photo.getId() + "/thumbnail"
                                    : (photo.getThumbnailUrl() != null ? photo.getThumbnailUrl() : photoUrl);
                            
                            return PhotoResponse.builder()
                                    .id(photo.getId())
                                    .fileUrl(photoUrl)
                                    .thumbnailUrl(thumbUrl)
                                    .fileName(photo.getFileName())
                                    .isCover(photo.getIsCover())
                                    .displayOrder(photo.getDisplayOrder())
                                    .build();
                        })
                        .collect(Collectors.toList())
                : List.of();

        return PublicationResponse.builder()
                .id(publication.getId())
                .contentType(publication.getContentType())
                .primaryNames(publication.getPrimaryNames())
                .specialDate(publication.getSpecialDate())
                .slug(publication.getSlug())
                .story(publication.getStory())
                .tags(tags)
                .status(publication.getStatus())
                .scheduledFor(publication.getScheduledFor())
                .viewCount(publication.getViewCount())
                .createdBy(publication.getCreatedBy())
                .createdAt(publication.getCreatedAt())
                .updatedAt(publication.getUpdatedAt())
                .publishedAt(publication.getPublishedAt())
                .photos(photos)
                .build();
    }
}

