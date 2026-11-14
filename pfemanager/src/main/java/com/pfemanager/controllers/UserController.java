package com.pfemanager.controllers;

import com.pfemanager.entities.User;
import com.pfemanager.services.EmailService;
import com.pfemanager.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private EmailService emailService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    public UserController(UserService userService, com.pfemanager.services.EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @PatchMapping("/{id}/valider")
    public ResponseEntity<?> validerCompte(@PathVariable("id") Long id) {
        User user = userService.getById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setEnabled(true);
        userService.save(user);

        emailService.notifierUtilisateurCompteApprouve(user.getEmail(), user.getPrenom(), user.getNom());
        return ResponseEntity.ok(java.util.Map.of("message", "Compte approuvé et email de confirmation envoyé."));
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable("id") Long id) {
        return userService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }
    
    
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable("id") Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.update(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}