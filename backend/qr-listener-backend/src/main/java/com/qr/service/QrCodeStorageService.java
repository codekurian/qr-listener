package com.qr.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
public class QrCodeStorageService {

    @Value("${qr.storage.type:local}")
    private String storageType;

    @Value("${qr.storage.path:./storage/qr-codes}")
    private String storagePath;

    @Value("${qr.storage.base-url:http://localhost:8082/api/qr/images}")
    private String baseUrl;

    public String saveQrCode(String qrId, byte[] qrImageData) {
        log.info("Saving QR code image for ID: {}", qrId);
        
        String fileName = generateFileName(qrId);
        String filePath = buildFilePath(fileName);
        
        try {
            switch (storageType) {
                case "local":
                    return saveToLocalFileSystem(filePath, qrImageData);
                case "s3":
                    return saveToS3(fileName, qrImageData);
                case "database":
                    return saveToDatabase(qrId, qrImageData);
                default:
                    throw new IllegalArgumentException("Unsupported storage type: " + storageType);
            }
        } catch (Exception e) {
            log.error("Failed to save QR code image for ID: {}", qrId, e);
            throw new RuntimeException("Failed to save QR code image", e);
        }
    }

    public byte[] getQrCodeImage(String qrId) {
        log.debug("Retrieving QR code image for ID: {}", qrId);
        
        String fileName = generateFileName(qrId);
        String filePath = buildFilePath(fileName);
        
        try {
            Path path = Paths.get(storagePath, filePath);
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            } else {
                log.warn("QR code image not found for ID: {}", qrId);
                return null;
            }
        } catch (IOException e) {
            log.error("Failed to read QR code image for ID: {}", qrId, e);
            throw new RuntimeException("Failed to read QR code image", e);
        }
    }

    public String getQrCodeImageUrl(String qrId) {
        String fileName = generateFileName(qrId);
        return baseUrl + "/" + fileName;
    }

    public boolean deleteQrCodeImage(String qrId) {
        log.info("Deleting QR code image for ID: {}", qrId);
        
        String fileName = generateFileName(qrId);
        String filePath = buildFilePath(fileName);
        
        try {
            Path path = Paths.get(storagePath, filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Successfully deleted QR code image for ID: {}", qrId);
                return true;
            } else {
                log.warn("QR code image not found for deletion: {}", qrId);
                return false;
            }
        } catch (IOException e) {
            log.error("Failed to delete QR code image for ID: {}", qrId, e);
            return false;
        }
    }

    private String generateFileName(String qrId) {
        return qrId + ".png";
    }

    private String buildFilePath(String fileName) {
        LocalDate now = LocalDate.now();
        return String.format("%d/%02d/%s", 
            now.getYear(), 
            now.getMonthValue(), 
            fileName);
    }

    private String saveToLocalFileSystem(String filePath, byte[] qrImageData) throws IOException {
        Path fullPath = Paths.get(storagePath, filePath);
        
        // Create directory if it doesn't exist
        Files.createDirectories(fullPath.getParent());
        
        // Write file
        Files.write(fullPath, qrImageData);
        
        log.info("QR code image saved to: {}", fullPath);
        return baseUrl + "/" + filePath;
    }

    private String saveToS3(String fileName, byte[] qrImageData) {
        // TODO: Implement S3 storage
        log.warn("S3 storage not implemented yet, falling back to local storage");
        try {
            return saveToLocalFileSystem(fileName, qrImageData);
        } catch (IOException e) {
            log.error("Failed to save to local filesystem", e);
            return null;
        }
    }

    private String saveToDatabase(String qrId, byte[] qrImageData) {
        // TODO: Implement database storage
        log.warn("Database storage not implemented yet, falling back to local storage");
        try {
            return saveToLocalFileSystem(qrId + ".png", qrImageData);
        } catch (IOException e) {
            log.error("Failed to save to local filesystem", e);
            return null;
        }
    }
}
