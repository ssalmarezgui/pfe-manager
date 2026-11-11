package com.pfemanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String tel;
    private String nom;
    private String prenom;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_entreprise")
    private Entreprise entreprise;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_labo")
    private LaboRecherche labo;

    @OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SujetPFE> sujetsDeposes = new ArrayList<>();

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public LaboRecherche getLabo() { return labo; }
    public void setLabo(LaboRecherche labo) { this.labo = labo; }

    public List<SujetPFE> getSujetsDeposes() { return sujetsDeposes; }
    public void setSujetsDeposes(List<SujetPFE> sujetsDeposes) { this.sujetsDeposes = sujetsDeposes; }
}