package com.pfemanager.services;

import com.pfemanager.dto.SujetPFERequest;
import com.pfemanager.entities.StatutSujet;
import com.pfemanager.entities.SujetPFE;
import com.pfemanager.repositories.EntrepriseRepository;
import com.pfemanager.repositories.LaboRechercheRepository;
import com.pfemanager.repositories.SujetPFERepository;
import com.pfemanager.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SujetPFEService {

    private final SujetPFERepository sujetRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final LaboRechercheRepository laboRepository;
    private final UserRepository userRepository;

    public SujetPFEService(SujetPFERepository sujetRepository,
                           EntrepriseRepository entrepriseRepository,
                           LaboRechercheRepository laboRepository,
                           UserRepository userRepository) {
        this.sujetRepository = sujetRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.laboRepository = laboRepository;
        this.userRepository = userRepository;
    }

    public List<SujetPFE> getAll() {
        return sujetRepository.findAll();
    }

    public Optional<SujetPFE> getById(Long id) {
        return sujetRepository.findById(id);
    }


    public List<SujetPFE> getEnAttente() {
        return sujetRepository.findByStatut(StatutSujet.EN_ATTENTE);
    }

    public List<SujetPFE> getByEntreprise(Long idEntreprise) {
        return sujetRepository.findByEntrepriseId(idEntreprise);
    }

    public List<SujetPFE> getByLabo(Long idLabo) {
        return sujetRepository.findByLaboId(idLabo);
    }

    public List<SujetPFE> getByEtudiant(Long idEtudiant) {
        return sujetRepository.findByEtudiantId(idEtudiant);
    }

    public SujetPFE create(SujetPFERequest request) {
        SujetPFE sujet = new SujetPFE();
        sujet.setTitre(request.getTitre());
        sujet.setTechnologies(request.getTechnologies());
        sujet.setDuree(request.getDuree());
        sujet.setDescription(request.getDescription());
        sujet.setStatut(StatutSujet.EN_ATTENTE); // Toujours EN_ATTENTE au dépôt

        if (request.getIdEntreprise() != null) {
            entrepriseRepository.findById(request.getIdEntreprise()).ifPresent(sujet::setEntreprise);
        }
        if (request.getIdLabo() != null) {
            laboRepository.findById(request.getIdLabo()).ifPresent(sujet::setLabo);
        }
        if (request.getIdEtudiant() != null) {
            userRepository.findById(request.getIdEtudiant()).ifPresent(sujet::setEtudiant);
        }

        return sujetRepository.save(sujet);
    }

    public SujetPFE save(SujetPFE sujet) {
        return sujetRepository.save(sujet);
    }

    public SujetPFE update(Long id, SujetPFERequest request) {
        return sujetRepository.findById(id).map(sujet -> {
            sujet.setTitre(request.getTitre());
            sujet.setTechnologies(request.getTechnologies());
            sujet.setDuree(request.getDuree());
            sujet.setDescription(request.getDescription());
            sujet.setStatut(StatutSujet.EN_ATTENTE); // Règle CDC : repasse en EN_ATTENTE après modif
            return sujetRepository.save(sujet);
        }).orElseThrow(() -> new RuntimeException("Sujet introuvable avec l'id : " + id));
    }

    // Validation ou Refus par l'Admin
    public SujetPFE changerStatut(Long id, StatutSujet statut) {
        return sujetRepository.findById(id).map(sujet -> {
            sujet.setStatut(statut);
            return sujetRepository.save(sujet);
        }).orElseThrow(() -> new RuntimeException("Sujet introuvable avec l'id : " + id));
    }
    
    public List<SujetPFE> getValides() {
        return sujetRepository.findByStatut(StatutSujet.VALIDE).stream()
                .filter(s -> s.getEtudiant() == null)
                .toList();
    }

    public List<SujetPFE> search(String keyword, String technologie) {
        return sujetRepository.searchSujets(StatutSujet.VALIDE, keyword, technologie).stream()
                .filter(s -> s.getEtudiant() == null)
                .toList();
    }
    public void delete(Long id) {
        sujetRepository.deleteById(id);
    }
}