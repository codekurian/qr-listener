package com.qr.repository;

import com.qr.entity.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {

    Optional<Publication> findBySlug(String slug);

    Page<Publication> findByStatus(Publication.PublicationStatus status, Pageable pageable);

    @Query("SELECT p FROM Publication p WHERE " +
           "LOWER(p.primaryNames) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.story) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Publication> searchPublications(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Publication p WHERE " +
           "p.status = :status AND (" +
           "LOWER(p.primaryNames) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.story) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Publication> searchPublicationsByStatus(
            @Param("query") String query,
            @Param("status") Publication.PublicationStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM Publication p WHERE p.status = :status")
    Long countByStatus(@Param("status") Publication.PublicationStatus status);

    @Query("SELECT SUM(p.viewCount) FROM Publication p")
    Long getTotalViewCount();
}

