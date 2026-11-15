package com.pfemanager.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.pfemanager.entities.User;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${pfemanager.admin.email:ssalmarezgui@gmail.com}")
    private String adminEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 1. Email envoyé à l'Administrateur (ssalmarezgui@gmail.com) lorsqu'un compte demande vérification
    public void notifierAdminNouvelleInscription(String userNom, String userPrenom, String userEmail, String userRole) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("ssalmarezgui@gmail.com");
            message.setSubject("Action requise : Nouveau compte en attente de vérification sur PFE Manager");
            message.setText("Bonjour Administrateur,\n\n" +
                    "Un nouveau compte vient d'être créé sur PFE Manager et attend votre vérification :\n" +
                    "- Nom complet : " + userPrenom + " " + userNom + "\n" +
                    "- Email : " + userEmail + "\n" +
                    "- Rôle demandé : " + userRole + "\n\n" +
                    "Connectez-vous à votre espace Administration -> Gestion Utilisateurs pour approuver ou suspendre ce compte.\n\n" +
                    "Cordialement,\nSystème PFE Manager.");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] Erreur envoi admin : " + e.getMessage());
        }
    }

    // 2. Email envoyé au nouvel utilisateur lors de la création de son compte (en attente)
    public void notifierUtilisateurInscriptionEnAttente(String userEmail, String userPrenom, String userNom) {
        if (userEmail == null || userEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject("Inscription reçue — Compte en attente de validation");
            message.setText("Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                    "Votre demande de création de compte sur PFE Manager a bien été enregistrée.\n" +
                    "Votre compte est actuellement en attente de vérification par l'administrateur.\n" +
                    "Vous recevrez un email de confirmation dès qu'il sera validé et activé.\n\n" +
                    "Cordialement,\nL'équipe PFE Manager.");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] Erreur envoi attente inscription : " + e.getMessage());
        }
    }

    // 3. Email envoyé à l'utilisateur lorsque l'Admin valide son compte
    public void notifierUtilisateurCompteApprouve(String userEmail, String userPrenom, String userNom) {
        if (userEmail == null || userEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject("Votre compte PFE Manager a été approuvé !");
            message.setText("Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                    "Bonne nouvelle ! Votre compte sur PFE Manager a été validé par l'administrateur.\n" +
                    "Vous pouvez dès maintenant accéder à votre espace en vous connectant avec votre adresse email et votre mot de passe.\n\n" +
                    "Cordialement,\nL'équipe PFE Manager.");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] Erreur envoi approbation : " + e.getMessage());
        }
    }

    // 4. Email envoyé à l'utilisateur lorsque l'Admin suspend ou refuse son compte
    public void notifierUtilisateurCompteSuspendu(String userEmail, String userPrenom, String userNom) {
        if (userEmail == null || userEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject("Mise à jour concernant votre compte PFE Manager");
            message.setText("Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                    "Nous vous informons que votre compte PFE Manager a été suspendu ou n'a pas été approuvé par l'administrateur.\n" +
                    "Pour toute réclamation ou vérification complémentaire, veuillez contacter l'administration (ssalmarezgui@gmail.com).\n\n" +
                    "Cordialement,\nL'équipe PFE Manager.");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] Erreur envoi suspension : " + e.getMessage());
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