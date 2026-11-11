package com.pfemanager.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pfemanager.entities.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String email;
    private String nom;
    private String prenom;

    @JsonIgnore
    private String password;

    private Long idEntreprise;
    private Long idLabo;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String email, String nom, String prenom, String password,
                            Long idEntreprise, Long idLabo, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.password = password;
        this.idEntreprise = idEntreprise;
        this.idLabo = idLabo;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getLibelle().name()))
                .collect(Collectors.toList());

        Long idEnt = (user.getEntreprise() != null) ? user.getEntreprise().getId() : null;
        Long idLab = (user.getLabo() != null) ? user.getLabo().getId() : null;

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getPassword(),
                idEnt,
                idLab,
                authorities);
    }

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public Long getIdEntreprise() { return idEntreprise; }
    public Long getIdLabo() { return idLabo; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return email; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}