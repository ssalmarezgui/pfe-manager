package com.pfemanager.dto;

public class SujetPFERequest {
    private String titre;
    private String technologies;
    private String duree;
    private String description;
    private Long idEntreprise;
    private Long idLabo;
    private Long idEtudiant;

    public SujetPFERequest() {}

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getTechnologies() { return technologies; }
    public void setTechnologies(String technologies) { this.technologies = technologies; }

    public String getDuree() { return duree; }
    public void setDuree(String duree) { this.duree = duree; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getIdEntreprise() { return idEntreprise; }
    public void setIdEntreprise(Long idEntreprise) { this.idEntreprise = idEntreprise; }

    public Long getIdLabo() { return idLabo; }
    public void setIdLabo(Long idLabo) { this.idLabo = idLabo; }

    public Long getIdEtudiant() { return idEtudiant; }
    public void setIdEtudiant(Long idEtudiant) { this.idEtudiant = idEtudiant; }
}