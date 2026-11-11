package com.pfemanager.controllers;

import com.pfemanager.entities.LaboRecherche;
import com.pfemanager.services.LaboRechercheService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/labos")
public class LaboRechercheController {

    private final LaboRechercheService laboService;

    public LaboRechercheController(LaboRechercheService laboService) {
        this.laboService = laboService;
    }

    @GetMapping
    public List<LaboRecherche> getAll() {
        return laboService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaboRecherche> getById(@PathVariable("id") Long id) {
        return laboService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LaboRecherche create(@RequestBody LaboRecherche labo) {
        return laboService.save(labo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LaboRecherche> update(@PathVariable("id") Long id, @RequestBody LaboRecherche labo) {
        return ResponseEntity.ok(laboService.update(id, labo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        laboService.delete(id);
        return ResponseEntity.noContent().build();
    }
}