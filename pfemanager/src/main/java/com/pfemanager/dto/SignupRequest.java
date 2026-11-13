package com.pfemanager.dto;

public class SignupRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String tel;
    private String role;
    private Long idEntreprise;
    private Long idLabo;
    private String nomLabo;

    private String nomEntreprise;

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

    public String getNomEntreprise() { return nomEntreprise; }
    public void setNomEntreprise(String nomEntreprise) { this.nomEntreprise = nomEntreprise; }

    public Long getIdLabo() { return idLabo; }
    public void setIdLabo(Long idLabo) { this.idLabo = idLabo; }

    public String getNomLabo() { return nomLabo; }
    public void setNomLabo(String nomLabo) { this.nomLabo = nomLabo; }
}