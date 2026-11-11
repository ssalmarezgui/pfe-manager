package com.pfemanager.services;

import com.pfemanager.entities.Entreprise;
import com.pfemanager.repositories.EntrepriseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepriseService {
    private final EntrepriseRepository entrepriseRepository;

    public EntrepriseService(EntrepriseRepository entrepriseRepository) {
        this.entrepriseRepository = entrepriseRepository;
    }

    public List<Entreprise> getAll() {
        return entrepriseRepository.findAll();
    }

    public Optional<Entreprise> getById(Long id) {
        return entrepriseRepository.findById(id);
    }

    public Entreprise save(Entreprise entreprise) {
        return entrepriseRepository.save(entreprise);
    }

    public Entreprise update(Long id, Entreprise updated) {
        return entrepriseRepository.findById(id).map(e -> {
            e.setNom(updated.getNom());
            e.setSecteur(updated.getSecteur());
            e.setLogo(updated.getLogo());
            e.setTel(updated.getTel());
            e.setEmail(updated.getEmail());
            e.setAdresse(updated.getAdresse());
            return entrepriseRepository.save(e);
        }).orElseThrow(() -> new RuntimeException("Entreprise non trouvée avec l'id : " + id));
    }

    public void delete(Long id) {
        entrepriseRepository.deleteById(id);
    }
}