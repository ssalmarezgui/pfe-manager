package com.pfemanager.controllers;

import com.pfemanager.entities.Candidature;
import com.pfemanager.entities.SujetPFE;
import com.pfemanager.entities.User;
import com.pfemanager.repositories.CandidatureRepository;
import com.pfemanager.repositories.SujetPFERepository;
import com.pfemanager.repositories.UserRepository;
import com.pfemanager.services.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/candidatures")
public class CandidatureController {

    private final CandidatureRepository candidatureRepository;
    private final SujetPFERepository sujetRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public CandidatureController(CandidatureRepository candidatureRepository,
                                 SujetPFERepository sujetRepository,
                                 UserRepository userRepository,
                                 EmailService emailService) {
        this.candidatureRepository = candidatureRepository;
        this.sujetRepository = sujetRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // 1. L'étudiant postule à un sujet
    @PostMapping("/postuler")
    public ResponseEntity<?> postuler(@RequestBody Map<String, Long> body) {
        Long idSujet = body.get("idSujet");
        Long idEtudiant = body.get("idEtudiant");

        if (candidatureRepository.existsBySujetIdAndEtudiantId(idSujet, idEtudiant)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vous avez déjà postulé à ce sujet."));
        }

        SujetPFE sujet = sujetRepository.findById(idSujet).orElseThrow();
        User etudiant = userRepository.findById(idEtudiant).orElseThrow();

        Candidature c = new Candidature();
        c.setSujet(sujet);
        c.setEtudiant(etudiant);
        c.setStatut("EN_ATTENTE");
        candidatureRepository.save(c);

        // Envoi de la notification email à l'entreprise ou au laboratoire
        String organismeNom = sujet.getEntreprise() != null ? sujet.getEntreprise().getNom()
                : (sujet.getLabo() != null ? sujet.getLabo().getNom() : "l'organisme");
        String organismeEmail = sujet.getEntreprise() != null ? sujet.getEntreprise().getEmail()
                : (sujet.getLabo() != null ? sujet.getLabo().getEmail() : null);

        emailService.notifierOrganismeNouvelleCandidature(organismeEmail, organismeNom, sujet.getTitre(), etudiant);

        return ResponseEntity.ok(Map.of(
                "message", "Votre demande a bien été reçue par " + organismeNom + ". Nous allons vous contacter prochainement pour le déroulement du stage et les entretiens.",
                "organisme", organismeNom
        ));
    }

    // 2. Récupérer les candidatures reçues par une entreprise ou un labo
    @GetMapping("/entreprise/{id}")
    public List<Candidature> getByEntreprise(@PathVariable("id") Long id) {
        return candidatureRepository.findBySujetEntrepriseId(id);
    }

    @GetMapping("/labo/{id}")
    public List<Candidature> getByLabo(@PathVariable("id") Long id) {
        return candidatureRepository.findBySujetLaboId(id);
    }

    @GetMapping("/etudiant/{id}")
    public List<Candidature> getByEtudiant(@PathVariable("id") Long id) {
        return candidatureRepository.findByEtudiantId(id);
    }

    // 3. Accepter un étudiant -> Affecte le sujet à l'étudiant (donc le retire du catalogue) et refuse les autres
    @PatchMapping("/{id}/accepter")
    public ResponseEntity<?> accepter(@PathVariable("id") Long id) {
        Candidature choisie = candidatureRepository.findById(id).orElseThrow();
        SujetPFE sujet = choisie.getSujet();
        User etudiant = choisie.getEtudiant();

        choisie.setStatut("ACCEPTEE");
        candidatureRepository.save(choisie);

        // Attribue le sujet à l'étudiant -> disparaît automatiquement du catalogue public !
        sujet.setEtudiant(etudiant);
        sujetRepository.save(sujet);

        String organismeNom = sujet.getEntreprise() != null ? sujet.getEntreprise().getNom()
                : (sujet.getLabo() != null ? sujet.getLabo().getNom() : "l'organisme");

        // Clôture automatiquement les autres candidatures en attente sur ce même sujet
        List<Candidature> autres = candidatureRepository.findBySujetId(sujet.getId());
        for (Candidature autre : autres) {
            if (!autre.getId().equals(choisie.getId()) && "EN_ATTENTE".equals(autre.getStatut())) {
                autre.setStatut("REFUSEE");
                candidatureRepository.save(autre);
                emailService.notifierEtudiantDecision(autre.getEtudiant().getEmail(), autre.getEtudiant().getPrenom(), organismeNom, sujet.getTitre(), false);
            }
        }

        emailService.notifierEtudiantDecision(etudiant.getEmail(), etudiant.getPrenom(), organismeNom, sujet.getTitre(), true);
        return ResponseEntity.ok(Map.of("message", "Candidature acceptée ! Le sujet a été retiré du catalogue et attribué à l'étudiant."));
    }

    // 4. Refuser un étudiant -> Le sujet reste dans le catalogue
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<?> refuser(@PathVariable("id") Long id) {
        Candidature c = candidatureRepository.findById(id).orElseThrow();
        c.setStatut("REFUSEE");
        candidatureRepository.save(c);

        SujetPFE sujet = c.getSujet();
        String organismeNom = sujet.getEntreprise() != null ? sujet.getEntreprise().getNom()
                : (sujet.getLabo() != null ? sujet.getLabo().getNom() : "l'organisme");

        emailService.notifierEtudiantDecision(c.getEtudiant().getEmail(), c.getEtudiant().getPrenom(), organismeNom, sujet.getTitre(), false);
        return ResponseEntity.ok(Map.of("message", "Candidature refusée. Le sujet reste disponible dans le catalogue."));
    }
}