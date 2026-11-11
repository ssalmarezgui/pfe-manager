package com.pfemanager.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private List<String> roles;
    private Long idEntreprise;
    private Long idLabo;

    public JwtResponse(String accessToken, Long id, String email, String nom, String prenom, List<String> roles, Long idEntreprise, Long idLabo) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.roles = roles;
        this.idEntreprise = idEntreprise;
        this.idLabo = idLabo;
    }

    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public List<String> getRoles() { return roles; }
    public Long getIdEntreprise() { return idEntreprise; }
    public Long getIdLabo() { return idLabo; }
}