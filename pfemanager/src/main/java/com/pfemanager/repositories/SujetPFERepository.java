package com.pfemanager.repositories;

import com.pfemanager.entities.StatutSujet;
import com.pfemanager.entities.SujetPFE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SujetPFERepository extends JpaRepository<SujetPFE, Long> {

    List<SujetPFE> findByStatut(StatutSujet statut);

    List<SujetPFE> findByEntrepriseId(Long entrepriseId);

    List<SujetPFE> findByLaboId(Long laboId);

    List<SujetPFE> findByEtudiantId(Long etudiantId);

    long countByStatut(StatutSujet statut);

    // Recherche par mot-clé et technologie
    @Query("SELECT s FROM SujetPFE s WHERE s.statut = :statut AND " +
           "(:keyword IS NULL OR LOWER(s.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(CAST(s.description AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:technologie IS NULL OR LOWER(s.technologies) LIKE LOWER(CONCAT('%', :technologie, '%')))")
    List<SujetPFE> searchSujets(@Param("statut") StatutSujet statut,
                                @Param("keyword") String keyword,
                                @Param("technologie") String technologie);

    @Query("SELECT s.technologies, COUNT(s) FROM SujetPFE s WHERE s.statut = 'VALIDE' GROUP BY s.technologies")
    List<Object[]> countSujetsByTechnology();
}