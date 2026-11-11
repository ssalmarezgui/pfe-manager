package com.pfemanager.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "sujets_pfe")
public class SujetPFE {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String technologies;
    private String duree;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutSujet statut = StatutSujet.EN_ATTENTE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_entreprise")
    private Entreprise entreprise;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_labo")
    private LaboRecherche labo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_user")
    private User etudiant;

    private String conventionNom;
    private String conventionDate;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String conventionData;

    private String attestationNom;
    private String attestationDate;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String attestationData;

    private String rapportNom;
    private String rapportDate;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String rapportData;

    public SujetPFE() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getTechnologies() { return technologies; }
    public void setTechnologies(String technologies) { this.technologies = technologies; }

    public String getDuree() { return duree; }
    public void setDuree(String duree) { this.duree = duree; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StatutSujet getStatut() { return statut; }
    public void setStatut(StatutSujet statut) { this.statut = statut; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public LaboRecherche getLabo() { return labo; }
    public void setLabo(LaboRecherche labo) { this.labo = labo; }

    public User getEtudiant() { return etudiant; }
    public void setEtudiant(User etudiant) { this.etudiant = etudiant; }

    // Getters & Setters pour les documents
    public String getConventionNom() { return conventionNom; }
    public void setConventionNom(String conventionNom) { this.conventionNom = conventionNom; }

    public String getConventionDate() { return conventionDate; }
    public void setConventionDate(String conventionDate) { this.conventionDate = conventionDate; }

    public String getConventionData() { return conventionData; }
    public void setConventionData(String conventionData) { this.conventionData = conventionData; }

    public String getAttestationNom() { return attestationNom; }
    public void setAttestationNom(String attestationNom) { this.attestationNom = attestationNom; }

    public String getAttestationDate() { return attestationDate; }
    public void setAttestationDate(String attestationDate) { this.attestationDate = attestationDate; }

    public String getAttestationData() { return attestationData; }
    public void setAttestationData(String attestationData) { this.attestationData = attestationData; }

    public String getRapportNom() { return rapportNom; }
    public void setRapportNom(String rapportNom) { this.rapportNom = rapportNom; }

    public String getRapportDate() { return rapportDate; }
    public void setRapportDate(String rapportDate) { this.rapportDate = rapportDate; }

    public String getRapportData() { return rapportData; }
    public void setRapportData(String rapportData) { this.rapportData = rapportData; }
}