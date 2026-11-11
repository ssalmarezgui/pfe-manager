package com.pfemanager.services;

import com.pfemanager.entities.LaboRecherche;
import com.pfemanager.repositories.LaboRechercheRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaboRechercheService {
    private final LaboRechercheRepository laboRepository;

    public LaboRechercheService(LaboRechercheRepository laboRepository) {
        this.laboRepository = laboRepository;
    }

    public List<LaboRecherche> getAll() {
        return laboRepository.findAll();
    }

    public Optional<LaboRecherche> getById(Long id) {
        return laboRepository.findById(id);
    }

    public LaboRecherche save(LaboRecherche labo) {
        return laboRepository.save(labo);
    }

    public LaboRecherche update(Long id, LaboRecherche updated) {
        return laboRepository.findById(id).map(l -> {
            l.setNom(updated.getNom());
            l.setDomaine(updated.getDomaine());
            l.setEtablissement(updated.getEtablissement());
            l.setTel(updated.getTel());
            l.setEmail(updated.getEmail());
            l.setAdresse(updated.getAdresse());
            return laboRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Laboratoire non trouvé avec l'id : " + id));
    }

    public void delete(Long id) {
        laboRepository.deleteById(id);
    }
}