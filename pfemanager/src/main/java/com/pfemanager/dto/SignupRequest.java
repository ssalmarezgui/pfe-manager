package com.pfemanager.dto;

public class SignupRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String tel;
    private String role; // "etudiant", "entreprise" ou "enseignant"
    private Long idEntreprise; // Optionnel (si rôle entreprise)
    private Long idLabo;       // Optionnel (si rôle enseignant)

    public SignupRequest() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getIdEntreprise() { return idEntreprise; }
    public void setIdEntreprise(Long idEntreprise) { this.idEntreprise = idEntreprise; }

    public Long getIdLabo() { return idLabo; }
    public void setIdLabo(Long idLabo) { this.idLabo = idLabo; }
}