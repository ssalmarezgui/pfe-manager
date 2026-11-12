package com.pfemanager.controllers;

import com.pfemanager.dto.SujetPFERequest;
import com.pfemanager.entities.StatutSujet;
import com.pfemanager.entities.SujetPFE;
import com.pfemanager.services.SujetPFEService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/sujets")
public class SujetPFEController {

    private final SujetPFEService sujetService;

    public SujetPFEController(SujetPFEService sujetService) {
        this.sujetService = sujetService;
    }

    @GetMapping
    public List<SujetPFE> getAll() {
        return sujetService.getAll();
    }

    @GetMapping("/valides")
    public List<SujetPFE> getValides() {
        return sujetService.getValides();
    }

    @GetMapping("/en-attente")
    public List<SujetPFE> getEnAttente() {
        return sujetService.getEnAttente();
    }

    @GetMapping("/entreprise/{id}")
    public List<SujetPFE> getByEntreprise(@PathVariable("id") Long id) {
        return sujetService.getByEntreprise(id);
    }

    @GetMapping("/labo/{id}")
    public List<SujetPFE> getByLabo(@PathVariable("id") Long id) {
        return sujetService.getByLabo(id);
    }

    @GetMapping("/etudiant/{id}")
    public List<SujetPFE> getByEtudiant(@PathVariable("id") Long id) {
        return sujetService.getByEtudiant(id);
    }

    @GetMapping("/search")
    public List<SujetPFE> search(@RequestParam(value = "keyword", required = false) String keyword,
                                 @RequestParam(value = "technologie", required = false) String technologie) {
        return sujetService.search(keyword, technologie);
    }

    @PostMapping
    public SujetPFE create(@RequestBody SujetPFERequest request) {
        return sujetService.create(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SujetPFE> update(@PathVariable("id") Long id, @RequestBody SujetPFERequest request) {
        return ResponseEntity.ok(sujetService.update(id, request));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/valider")
    public ResponseEntity<SujetPFE> valider(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sujetService.changerStatut(id, StatutSujet.VALIDE));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<SujetPFE> refuser(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sujetService.changerStatut(id, StatutSujet.REFUSE));
    }

    
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENTREPRISE') or hasRole('ENSEIGNANT') or hasRole('ETUDIANT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        sujetService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
 // Endpoint pour enregistrer un document PDF dans la base MySQL
    @PostMapping("/{id}/documents/{type}")
    public ResponseEntity<SujetPFE> uploadDocument(
            @PathVariable("id") Long id,
            @PathVariable("type") String type,
            @RequestBody java.util.Map<String, String> body) {

        SujetPFE sujet = sujetService.getAll().stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (sujet == null) return ResponseEntity.notFound().build();

        String nom = body.get("nom");
        String date = body.get("date");
        String data = body.get("data");

        if ("convention".equalsIgnoreCase(type)) {
            sujet.setConventionNom(nom);
            sujet.setConventionDate(date);
            sujet.setConventionData(data);
        } else if ("attestation".equalsIgnoreCase(type)) {
            sujet.setAttestationNom(nom);
            sujet.setAttestationDate(date);
            sujet.setAttestationData(data);
        } else if ("rapport".equalsIgnoreCase(type)) {
            sujet.setRapportNom(nom);
            sujet.setRapportDate(date);
            sujet.setRapportData(data);
        }

        return ResponseEntity.ok(sujetService.save(sujet));
    }
}