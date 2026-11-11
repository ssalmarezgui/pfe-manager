package com.pfemanager.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
            message.setSubject("🔔 Nouvelle inscription sur PFE Manager");
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
}