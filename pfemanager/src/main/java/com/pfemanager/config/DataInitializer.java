package com.pfemanager.config;

import com.pfemanager.entities.ERole;
import com.pfemanager.entities.Role;
import com.pfemanager.entities.User;
import com.pfemanager.repositories.RoleRepository;
import com.pfemanager.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        for (ERole erole : ERole.values()) {
            if (roleRepository.findByLibelle(erole).isEmpty()) {
                Role role = new Role();
                role.setLibelle(erole);
                roleRepository.save(role);
            }
        }

        userRepository.findByEmail("admin@pfemanager.com").ifPresentOrElse(
            admin -> {
                // Si l'admin existe déjà avec l'ancien mot de passe en clair, on le hash
                if (!admin.getPassword().startsWith("$2a$")) {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(admin);
                }
            },
            () -> {
                User admin = new User();
                admin.setNom("Admin");
                admin.setPrenom("Principal");
                admin.setEmail("admin@pfemanager.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setTel("99999999");
                
                Role adminRole = roleRepository.findByLibelle(ERole.ROLE_ADMIN).get();
                admin.setRoles(Set.of(adminRole));
                userRepository.save(admin);
                System.out.println(">>> Compte Admin initialisé avec mot de passe hashé !");
            }
        );
    }
}