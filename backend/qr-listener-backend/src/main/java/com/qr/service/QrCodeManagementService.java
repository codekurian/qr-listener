package com.qr.service;

import com.qr.dto.*;
import com.qr.entity.QrCode;
import com.qr.repository.QrCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrCodeManagementService {

    private final QrCodeRepository qrCodeRepository;

    @Transactional(readOnly = true)
    public PagedResponse<QrCodeListResponse> getAllQrCodes(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching QR codes - page: {}, size: {}, sortBy: {}, sortDirection: {}", 
                page, size, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<QrCode> qrCodePage = qrCodeRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        
        List<QrCodeListResponse> content = qrCodePage.getContent().stream()
                .map(this::mapToQrCodeListResponse)
                .collect(Collectors.toList());

        return PagedResponse.<QrCodeListResponse>builder()
                .content(content)
                .page(qrCodePage.getNumber())
                .size(qrCodePage.getSize())
                .totalElements(qrCodePage.getTotalElements())
                .totalPages(qrCodePage.getTotalPages())
                .first(qrCodePage.isFirst())
                .last(qrCodePage.isLast())
                .hasNext(qrCodePage.hasNext())
                .hasPrevious(qrCodePage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<QrCodeListResponse> searchQrCodes(QrCodeSearchRequest searchRequest) {
        log.info("Searching QR codes with request: {}", searchRequest);

        int page = searchRequest.getPage() != null ? searchRequest.getPage() : 0;
        int size = searchRequest.getSize() != null ? searchRequest.getSize() : 10;
        String sortBy = searchRequest.getSortBy() != null ? searchRequest.getSortBy() : "createdAt";
        String sortDirection = searchRequest.getSortDirection() != null ? searchRequest.getSortDirection() : "desc";

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<QrCode> qrCodePage;
        
        if (searchRequest.getSearch() != null && !searchRequest.getSearch().trim().isEmpty()) {
            qrCodePage = qrCodeRepository.searchActiveQrCodes(searchRequest.getSearch(), pageable);
        } else if (searchRequest.getCreatedBy() != null && !searchRequest.getCreatedBy().trim().isEmpty()) {
            qrCodePage = qrCodeRepository.findByCreatedByAndIsActiveTrue(searchRequest.getCreatedBy(), pageable);
        } else {
            qrCodePage = qrCodeRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        }

        List<QrCodeListResponse> content = qrCodePage.getContent().stream()
                .map(this::mapToQrCodeListResponse)
                .collect(Collectors.toList());

        return PagedResponse.<QrCodeListResponse>builder()
                .content(content)
                .page(qrCodePage.getNumber())
                .size(qrCodePage.getSize())
                .totalElements(qrCodePage.getTotalElements())
                .totalPages(qrCodePage.getTotalPages())
                .first(qrCodePage.isFirst())
                .last(qrCodePage.isLast())
                .hasNext(qrCodePage.hasNext())
                .hasPrevious(qrCodePage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public QrCodeListResponse getQrCodeById(Long id) {
        log.info("Fetching QR code by ID: {}", id);
        
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR code not found with ID: " + id));
        
        if (!qrCode.getIsActive()) {
            throw new RuntimeException("QR code is inactive");
        }
        
        return mapToQrCodeListResponse(qrCode);
    }

    @Transactional(readOnly = true)
    public QrCodeListResponse getQrCodeByQrId(String qrId) {
        log.info("Fetching QR code by QR ID: {}", qrId);
        
        QrCode qrCode = qrCodeRepository.findByQrIdAndIsActiveTrue(qrId)
                .orElseThrow(() -> new RuntimeException("QR code not found with QR ID: " + qrId));
        
        return mapToQrCodeListResponse(qrCode);
    }

    @Transactional
    public QrCodeListResponse updateQrCode(Long id, QrCodeUpdateRequest updateRequest) {
        log.info("Updating QR code ID: {} with request: {}", id, updateRequest);
        
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR code not found with ID: " + id));
        
        if (!qrCode.getIsActive()) {
            throw new RuntimeException("Cannot update inactive QR code");
        }
        
        // Update fields
        if (updateRequest.getTargetUrl() != null) {
            qrCode.setTargetUrl(updateRequest.getTargetUrl());
        }
        if (updateRequest.getDescription() != null) {
            qrCode.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getIsActive() != null) {
            qrCode.setIsActive(updateRequest.getIsActive());
        }
        
        QrCode updatedQrCode = qrCodeRepository.save(qrCode);
        
        log.info("Successfully updated QR code: {}", updatedQrCode.getQrId());
        
        return mapToQrCodeListResponse(updatedQrCode);
    }

    @Transactional
    public boolean deleteQrCode(Long id) {
        log.info("Deleting QR code ID: {}", id);
        
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR code not found with ID: " + id));
        
        if (!qrCode.getIsActive()) {
            log.warn("QR code is already inactive: {}", qrCode.getQrId());
            return false;
        }
        
        qrCode.setIsActive(false);
        qrCodeRepository.save(qrCode);
        
        log.info("Successfully deleted QR code: {}", qrCode.getQrId());
        return true;
    }

    @Transactional(readOnly = true)
    public long getTotalQrCodesCount() {
        return qrCodeRepository.countActiveQrCodes();
    }

    @Transactional(readOnly = true)
    public List<QrCodeListResponse> getRecentQrCodes(int limit) {
        log.info("Fetching recent QR codes with limit: {}", limit);
        
        List<QrCode> recentQrCodes = qrCodeRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
        
        return recentQrCodes.stream()
                .map(this::mapToQrCodeListResponse)
                .collect(Collectors.toList());
    }

    private QrCodeListResponse mapToQrCodeListResponse(QrCode qrCode) {
        return QrCodeListResponse.builder()
                .id(qrCode.getId())
                .qrId(qrCode.getQrId())
                .targetUrl(qrCode.getTargetUrl())
                .description(qrCode.getDescription())
                .createdBy(qrCode.getCreatedBy())
                .createdAt(qrCode.getCreatedAt())
                .updatedAt(qrCode.getUpdatedAt())
                .isActive(qrCode.getIsActive())
                .imageUrl("/api/qr/" + qrCode.getQrId() + "/image")
                .downloadUrl("/api/qr/" + qrCode.getQrId() + "/download")
                .build();
    }
}
