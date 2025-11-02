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
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Slf4j
public class PhotoController {

    private final PublicationPhotoRepository publicationPhotoRepository;

    @GetMapping("/{photoId}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long photoId) {
        Optional<PublicationPhoto> photoOpt = publicationPhotoRepository.findById(photoId);
        
        if (photoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PublicationPhoto photo = photoOpt.get();
        byte[] imageData = photo.getImageData();
        
        // If image is stored in DB, return it
        if (imageData != null && imageData.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // Default, can be improved with actual MIME type detection
            headers.setContentLength(imageData.length);
            headers.setCacheControl("public, max-age=31536000"); // Cache for 1 year
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        }
        
        // If image is stored as URL (for backward compatibility or external storage)
        if (photo.getFileUrl() != null && photo.getFileUrl().startsWith("data:image")) {
            // Handle base64 data URL
            try {
                String base64Data = photo.getFileUrl().split(",")[1];
                byte[] decoded = Base64.getDecoder().decode(base64Data);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG);
                headers.setContentLength(decoded.length);
                headers.setCacheControl("public, max-age=31536000");
                return new ResponseEntity<>(decoded, headers, HttpStatus.OK);
            } catch (Exception e) {
                log.error("Error decoding base64 image", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{photoId}/thumbnail")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable Long photoId) {
        Optional<PublicationPhoto> photoOpt = publicationPhotoRepository.findById(photoId);
        
        if (photoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PublicationPhoto photo = photoOpt.get();
        byte[] thumbnailData = photo.getThumbnailData();
        
        // If thumbnail is stored in DB, return it
        if (thumbnailData != null && thumbnailData.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(thumbnailData.length);
            headers.setCacheControl("public, max-age=31536000");
            return new ResponseEntity<>(thumbnailData, headers, HttpStatus.OK);
        }
        
        // Fallback to full image if thumbnail not available
        byte[] imageData = photo.getImageData();
        if (imageData != null && imageData.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(imageData.length);
            headers.setCacheControl("public, max-age=31536000");
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        }
        
        return ResponseEntity.notFound().build();
    }
}

