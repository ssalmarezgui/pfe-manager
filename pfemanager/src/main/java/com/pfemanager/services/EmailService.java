package com.pfemanager.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.pfemanager.entities.User;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${pfemanager.admin.email:admin@pfemanager.com}")
    private String adminEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void notifierAdminNouvelleInscription(String userNom, String userPrenom, String userEmail, String userRole) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("Nouvelle inscription sur PFE Manager");
            message.setText("Bonjour Administrateur,\n\n" +
                    "Un nouvel utilisateur vient de s'inscrire sur la plateforme PFE Manager :\n" +
                    "- Nom complet : " + userPrenom + " " + userNom + "\n" +
                    "- Email : " + userEmail + "\n" +
                    "- Rôle choisi : " + userRole + "\n\n" +
                    "Cordialement,\nSystème PFE Manager.");

            mailSender.send(message);
            System.out.println(">>> [EMAIL] Notification envoyée à l'administrateur : " + adminEmail);
        } catch (Exception e) {
            // Évite de bloquer l'inscription si le serveur SMTP n'est pas encore configuré en local
            System.err.println(">>> [EMAIL WARN] Impossible d'envoyer l'email : " + e.getMessage());
        }
    }

    public void notifierOrganismeNouvelleCandidature(String destEmail, String organismeNom, String sujetTitre, User etudiant) {
        if (destEmail == null || destEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destEmail);
            message.setSubject("Nouvelle candidature PFE : " + sujetTitre);
            message.setText("Bonjour " + organismeNom + ",\n\n" +
                    "Un étudiant vient de postuler à votre sujet de PFE :\n" +
                    "- Sujet : " + sujetTitre + "\n" +
                    "- Étudiant : " + etudiant.getPrenom() + " " + etudiant.getNom() + "\n" +
                    "- Email : " + etudiant.getEmail() + "\n" +
                    "- Téléphone : " + (etudiant.getTel() != null ? etudiant.getTel() : "Non renseigné") + "\n\n" +
                    "Connectez-vous à votre espace PFE Manager (onglet 'Mes Sujets PFE') pour accepter ou refuser cette candidature.\n\n" +
                    "Cordialement,\nSystème PFE Manager.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] " + e.getMessage());
        }
    }

    public void notifierEtudiantDecision(String etudiantEmail, String etudiantNom, String organismeNom, String sujetTitre, boolean accepte) {
        if (etudiantEmail == null || etudiantEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(etudiantEmail);
            message.setSubject(accepte
                    ? "Candidature acceptée : " + sujetTitre
                    : "Réponse à votre candidature : " + sujetTitre);
            message.setText("Bonjour " + etudiantNom + ",\n\n" +
                    (accepte
                        ? "Bonne nouvelle ! Votre candidature pour le sujet \"" + sujetTitre + "\" a été ACCEPTÉE par " + organismeNom + ".\nCe sujet est désormais affecté à votre espace 'Mon Stage PFE'."
                        : "Nous vous informons que votre candidature pour le sujet \"" + sujetTitre + "\" n'a pas été retenue par " + organismeNom + ".\nVous pouvez postuler à d'autres offres sur le catalogue.") +
                    "\n\nCordialement,\nSystème PFE Manager.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] " + e.getMessage());
        }
    }
}