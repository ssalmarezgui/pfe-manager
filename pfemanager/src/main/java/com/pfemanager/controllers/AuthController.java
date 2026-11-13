package com.pfemanager.controllers;

import com.pfemanager.dto.*;
import com.pfemanager.entities.*;
import com.pfemanager.repositories.*;
import com.pfemanager.security.JwtUtils;
import com.pfemanager.security.UserDetailsImpl;
import com.pfemanager.services.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final LaboRechercheRepository laboRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          RoleRepository roleRepository, EntrepriseRepository entrepriseRepository,
                          LaboRechercheRepository laboRepository, PasswordEncoder encoder,
                          JwtUtils jwtUtils, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.laboRepository = laboRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getNom(),
                userDetails.getPrenom(),
                roles,
                userDetails.getIdEntreprise(),
                userDetails.getIdLabo()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur: L'email est déjà utilisé !"));
        }

        User user = new User();
        user.setNom(signUpRequest.getNom());
        user.setPrenom(signUpRequest.getPrenom());
        user.setEmail(signUpRequest.getEmail());
        user.setTel(signUpRequest.getTel());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        String strRole = signUpRequest.getRole() != null ? signUpRequest.getRole().toLowerCase() : "etudiant";

        // Règles CDC : Choix entre etudiant, entreprise ou enseignant. INTERDIT d'obtenir ROLE_ADMIN à l'inscription !
        switch (strRole) {
            case "entreprise":
                Role entrepriseRole = roleRepository.findByLibelle(ERole.ROLE_ENTREPRISE)
                        .orElseThrow(() -> new RuntimeException("Erreur: Rôle Entreprise introuvable."));
                roles.add(entrepriseRole);

                if (signUpRequest.getNomEntreprise() != null && !signUpRequest.getNomEntreprise().trim().isEmpty()) {
                    String nomEnt = signUpRequest.getNomEntreprise().trim();
                    Entreprise entreprise = entrepriseRepository.findAll().stream()
                            .filter(e -> e.getNom() != null && e.getNom().equalsIgnoreCase(nomEnt))
                            .findFirst()
                            .orElseGet(() -> {
                                Entreprise nouvelle = new Entreprise();
                                nouvelle.setNom(nomEnt);
                                nouvelle.setSecteur("Non précisé");
                                return entrepriseRepository.save(nouvelle);
                            });
                    user.setEntreprise(entreprise);
                } else if (signUpRequest.getIdEntreprise() != null) {
                    entrepriseRepository.findById(signUpRequest.getIdEntreprise()).ifPresent(user::setEntreprise);
                }
                break;

            case "enseignant":
                Role enseignantRole = roleRepository.findByLibelle(ERole.ROLE_ENSEIGNANT)
                        .orElseThrow(() -> new RuntimeException("Erreur: Rôle Enseignant introuvable."));
                roles.add(enseignantRole);
                if (signUpRequest.getIdLabo() != null) {
                    laboRepository.findById(signUpRequest.getIdLabo()).ifPresent(user::setLabo);
                }
                break;

            default:
                Role etudiantRole = roleRepository.findByLibelle(ERole.ROLE_ETUDIANT)
                        .orElseThrow(() -> new RuntimeException("Erreur: Rôle Étudiant introuvable."));
                roles.add(etudiantRole);
                break;
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Notification par Email à l'administrateur
        emailService.notifierAdminNouvelleInscription(user.getNom(), user.getPrenom(), user.getEmail(), strRole);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès !"));
    }
}