package com.qr.controller;

import com.qr.entity.PublicationPhoto;
import com.qr.repository.PublicationPhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Optional;

@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
@Slf4j
public class PublicationImageController {

    private final PublicationPhotoRepository publicationPhotoRepository;

    @GetMapping("/photos/{photoId}/image")
    public ResponseEntity<byte[]> getPhotoImage(@PathVariable Long photoId) {
        Optional<PublicationPhoto> photo = publicationPhotoRepository.findById(photoId);
        
        if (photo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PublicationPhoto publicationPhoto = photo.get();
        
        // Try to get binary data first (stored in DB)
        if (publicationPhoto.getImageData() != null && publicationPhoto.getImageData().length > 0) {
            // Determine content type from file name or default to JPEG
            String contentType = determineContentType(publicationPhoto.getFileName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(publicationPhoto.getImageData().length);
            headers.setCacheControl("public, max-age=31536000"); // Cache for 1 year
            
            return new ResponseEntity<>(publicationPhoto.getImageData(), headers, HttpStatus.OK);
        }
        
        // Fallback: if no binary data, try to decode from base64 data URL
        if (publicationPhoto.getFileUrl() != null && publicationPhoto.getFileUrl().startsWith("data:image")) {
            try {
                String base64Data = publicationPhoto.getFileUrl().split(",")[1];
                byte[] imageData = Base64.getDecoder().decode(base64Data);
                
                String contentType = publicationPhoto.getFileUrl().split(";")[0].substring(5); // Extract from "data:image/jpeg;base64,"
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                headers.setContentLength(imageData.length);
                headers.setCacheControl("public, max-age=31536000");
                
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to decode image from base64 URL for photo: {}", photoId, e);
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/photos/{photoId}/thumbnail")
    public ResponseEntity<byte[]> getPhotoThumbnail(@PathVariable Long photoId) {
        Optional<PublicationPhoto> photo = publicationPhotoRepository.findById(photoId);
        
        if (photo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PublicationPhoto publicationPhoto = photo.get();
        
        // Try to get thumbnail binary data first
        if (publicationPhoto.getThumbnailData() != null && publicationPhoto.getThumbnailData().length > 0) {
            String contentType = determineContentType(publicationPhoto.getFileName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(publicationPhoto.getThumbnailData().length);
            headers.setCacheControl("public, max-age=31536000");
            
            return new ResponseEntity<>(publicationPhoto.getThumbnailData(), headers, HttpStatus.OK);
        }
        
        // Fallback: use full image if no thumbnail
        if (publicationPhoto.getImageData() != null && publicationPhoto.getImageData().length > 0) {
            String contentType = determineContentType(publicationPhoto.getFileName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(publicationPhoto.getImageData().length);
            headers.setCacheControl("public, max-age=31536000");
            
            return new ResponseEntity<>(publicationPhoto.getImageData(), headers, HttpStatus.OK);
        }
        
        // Fallback: decode from base64 URL
        if (publicationPhoto.getThumbnailUrl() != null && publicationPhoto.getThumbnailUrl().startsWith("data:image")) {
            try {
                String base64Data = publicationPhoto.getThumbnailUrl().split(",")[1];
                byte[] imageData = Base64.getDecoder().decode(base64Data);
                
                String contentType = publicationPhoto.getThumbnailUrl().split(";")[0].substring(5);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                headers.setContentLength(imageData.length);
                headers.setCacheControl("public, max-age=31536000");
                
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to decode thumbnail from base64 URL for photo: {}", photoId, e);
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    private String determineContentType(String fileName) {
        if (fileName == null) {
            return "image/jpeg";
        }
        
        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".png")) {
            return "image/png";
        } else if (lowerFileName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFileName.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "image/jpeg"; // Default
        }
    }
}

