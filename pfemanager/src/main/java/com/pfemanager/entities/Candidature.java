package com.pfemanager.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidatures")
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sujet", nullable = false)
    private SujetPFE sujet;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_etudiant", nullable = false)
    private User etudiant;

    @Column(length = 20)
    private String statut = "EN_ATTENTE"; // EN_ATTENTE, ACCEPTEE, REFUSEE

    private LocalDateTime dateCandidature = LocalDateTime.now();

    public Candidature() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SujetPFE getSujet() { return sujet; }
    public void setSujet(SujetPFE sujet) { this.sujet = sujet; }

    public User getEtudiant() { return etudiant; }
    public void setEtudiant(User etudiant) { this.etudiant = etudiant; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getDateCandidature() { return dateCandidature; }
    public void setDateCandidature(LocalDateTime dateCandidature) { this.dateCandidature = dateCandidature; }
}