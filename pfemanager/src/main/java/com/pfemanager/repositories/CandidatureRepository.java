package com.pfemanager.repositories;

import com.pfemanager.entities.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findBySujetEntrepriseId(Long idEntreprise);
    List<Candidature> findBySujetLaboId(Long idLabo);
    List<Candidature> findBySujetId(Long idSujet);
    List<Candidature> findByEtudiantId(Long idEtudiant);
    boolean existsBySujetIdAndEtudiantId(Long idSujet, Long idEtudiant);
}