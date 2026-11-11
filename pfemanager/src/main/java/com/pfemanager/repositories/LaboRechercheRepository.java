package com.pfemanager.repositories;

import com.pfemanager.entities.LaboRecherche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LaboRechercheRepository extends JpaRepository<LaboRecherche, Long> {
}