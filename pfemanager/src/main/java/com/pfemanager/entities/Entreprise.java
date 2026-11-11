package com.pfemanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entreprises")
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String secteur;
    private String logo;
    private String tel;
    private String email;
    private String adresse;

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<User> representants = new ArrayList<>();

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SujetPFE> sujets = new ArrayList<>();

    public Entreprise() {}

    public Entreprise(Long id, String nom, String secteur, String logo, String tel, String email, String adresse) {
        this.id = id;
        this.nom = nom;
        this.secteur = secteur;
        this.logo = logo;
        this.tel = tel;
        this.email = email;
        this.adresse = adresse;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getSecteur() { return secteur; }
    public void setSecteur(String secteur) { this.secteur = secteur; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public List<User> getRepresentants() { return representants; }
    public void setRepresentants(List<User> representants) { this.representants = representants; }

    public List<SujetPFE> getSujets() { return sujets; }
    public void setSujets(List<SujetPFE> sujets) { this.sujets = sujets; }
}