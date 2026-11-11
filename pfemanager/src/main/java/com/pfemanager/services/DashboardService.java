package com.pfemanager.services;

import com.pfemanager.dto.DashboardStatsDTO;
import com.pfemanager.entities.ERole;
import com.pfemanager.entities.StatutSujet;
import com.pfemanager.repositories.EntrepriseRepository;
import com.pfemanager.repositories.LaboRechercheRepository;
import com.pfemanager.repositories.SujetPFERepository;
import com.pfemanager.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final SujetPFERepository sujetRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final LaboRechercheRepository laboRepository;
    private final UserRepository userRepository;

    public DashboardService(SujetPFERepository sujetRepository,
                            EntrepriseRepository entrepriseRepository,
                            LaboRechercheRepository laboRepository,
                            UserRepository userRepository) {
        this.sujetRepository = sujetRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.laboRepository = laboRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsDTO getStats() {
        long totalSujets = sujetRepository.count();
        long totalEntreprises = entrepriseRepository.count();
        long totalLabos = laboRepository.count();
        long sujetsEnAttente = sujetRepository.countByStatut(StatutSujet.EN_ATTENTE);
        long etudiantsInscrits = userRepository.countByRole(ERole.ROLE_ETUDIANT);

        // Répartition des technologies
        Map<String, Long> repartition = new HashMap<>();
        List<Object[]> results = sujetRepository.countSujetsByTechnology();
        for (Object[] row : results) {
            String tech = (String) row[0];
            Long count = (Long) row[1];
            if (tech != null) {
                repartition.put(tech, count);
            }
        }

        return new DashboardStatsDTO(totalSujets, totalEntreprises, totalLabos, sujetsEnAttente, etudiantsInscrits, repartition);
    }
}