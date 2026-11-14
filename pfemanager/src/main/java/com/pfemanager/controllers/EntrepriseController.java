package com.pfemanager.controllers;

import com.pfemanager.entities.Entreprise;
import com.pfemanager.entities.User;
import com.pfemanager.services.EntrepriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {

    private final EntrepriseService entrepriseService;

    public EntrepriseController(EntrepriseService entrepriseService) {
        this.entrepriseService = entrepriseService;
    }

    @GetMapping
    public List<Entreprise> getAll() {
        List<Entreprise> entreprises = entrepriseService.getAll();
        for (Entreprise e : entreprises) {
            boolean modifie = false;

            if (e.getRepresentants() != null && !e.getRepresentants().isEmpty()) {
                User rep = e.getRepresentants().get(0);
                if ((e.getEmail() == null || e.getEmail().isBlank()) && rep.getEmail() != null) {
                    e.setEmail(rep.getEmail());
                    modifie = true;
                }
                if ((e.getTel() == null || e.getTel().isBlank()) && rep.getTel() != null) {
                    e.setTel(rep.getTel());
                    modifie = true;
                }
            }

            if (e.getSecteur() == null || e.getSecteur().isBlank() || "Non précisé".equalsIgnoreCase(e.getSecteur())) {
                e.setSecteur("IT & Développement");
                modifie = true;
            }

            if (e.getAdresse() == null || e.getAdresse().isBlank()) {
                e.setAdresse("Tunis, Tunisie");
                modifie = true;
            }

            if (modifie) {
                entrepriseService.save(e);
            }
        }
        return entreprises;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entreprise> getById(@PathVariable("id") Long id) {
        return entrepriseService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Entreprise create(@RequestBody Entreprise entreprise) {
        return entrepriseService.save(entreprise);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entreprise> update(@PathVariable("id") Long id, @RequestBody Entreprise entreprise) {
        return ResponseEntity.ok(entrepriseService.update(id, entreprise));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        entrepriseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}