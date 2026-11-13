package com.pfemanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "labo_recherches")
public class LaboRecherche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String domaine;
    private String etablissement;
    private String tel;
    private String email;
    private String adresse;

    private String nomLabo;

    public String getNomLabo() { return nomLabo; }
    public void setNomLabo(String nomLabo) { this.nomLabo = nomLabo; }
    @OneToMany(mappedBy = "labo", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<User> enseignants = new ArrayList<>();

    @OneToMany(mappedBy = "labo", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SujetPFE> sujets = new ArrayList<>();

    public LaboRecherche() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDomaine() { return domaine; }
    public void setDomaine(String domaine) { this.domaine = domaine; }

    public String getEtablissement() { return etablissement; }
    public void setEtablissement(String etablissement) { this.etablissement = etablissement; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public List<User> getEnseignants() { return enseignants; }
    public void setEnseignants(List<User> enseignants) { this.enseignants = enseignants; }

    public List<SujetPFE> getSujets() { return sujets; }
    public void setSujets(List<SujetPFE> sujets) { this.sujets = sujets; }
}