package com.qr.repository;

import com.qr.entity.PublicationPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicationPhotoRepository extends JpaRepository<PublicationPhoto, Long> {
}

