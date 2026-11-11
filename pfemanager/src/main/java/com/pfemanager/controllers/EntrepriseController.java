package com.pfemanager.controllers;

import com.pfemanager.entities.Entreprise;
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
        return entrepriseService.getAll();
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