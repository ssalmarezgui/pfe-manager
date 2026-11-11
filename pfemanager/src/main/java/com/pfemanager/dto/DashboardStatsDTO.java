package com.pfemanager.dto;

import java.util.Map;

public class DashboardStatsDTO {
    private long totalSujets;
    private long totalEntreprises;
    private long totalLabos;
    private long sujetsEnAttente;
    private long etudiantsInscrits;
    private Map<String, Long> repartitionParTechnologie;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalSujets, long totalEntreprises, long totalLabos, 
                             long sujetsEnAttente, long etudiantsInscrits, 
                             Map<String, Long> repartitionParTechnologie) {
        this.totalSujets = totalSujets;
        this.totalEntreprises = totalEntreprises;
        this.totalLabos = totalLabos;
        this.sujetsEnAttente = sujetsEnAttente;
        this.etudiantsInscrits = etudiantsInscrits;
        this.repartitionParTechnologie = repartitionParTechnologie;
    }

    public long getTotalSujets() { return totalSujets; }
    public void setTotalSujets(long totalSujets) { this.totalSujets = totalSujets; }

    public long getTotalEntreprises() { return totalEntreprises; }
    public void setTotalEntreprises(long totalEntreprises) { this.totalEntreprises = totalEntreprises; }

    public long getTotalLabos() { return totalLabos; }
    public void setTotalLabos(long totalLabos) { this.totalLabos = totalLabos; }

    public long getSujetsEnAttente() { return sujetsEnAttente; }
    public void setSujetsEnAttente(long sujetsEnAttente) { this.sujetsEnAttente = sujetsEnAttente; }

    public long getEtudiantsInscrits() { return etudiantsInscrits; }
    public void setEtudiantsInscrits(long etudiantsInscrits) { this.etudiantsInscrits = etudiantsInscrits; }

    public Map<String, Long> getRepartitionParTechnologie() { return repartitionParTechnologie; }
    public void setRepartitionParTechnologie(Map<String, Long> repartitionParTechnologie) { this.repartitionParTechnologie = repartitionParTechnologie; }
}