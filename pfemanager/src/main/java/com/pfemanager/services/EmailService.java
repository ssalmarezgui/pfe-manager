package com.pfemanager.services;

import com.pfemanager.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${spring.mail.username:ssalmarezgui@gmail.com}")
    private String fromEmail;

    @Value("${pfemanager.admin.email:ssalmarezgui@gmail.com}")
    private String adminEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void envoyerEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;

        // 1. Envoi via API HTTPS Resend (recommandé sur Render pour contourner le blocage SMTP)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            try {
                String jsonPayload = "{"
                        + "\"from\":\"PFE Manager <onboarding@resend.dev>\","
                        + "\"to\":[\"" + escapeJson(to) + "\"],"
                        + "\"subject\":\"" + escapeJson(subject) + "\","
                        + "\"text\":\"" + escapeJson(body) + "\""
                        + "}";

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + resendApiKey.trim())
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println(">>> [EMAIL RESEND OK] Envoyé à : " + to);
                    return;
                } else {
                    System.err.println(">>> [EMAIL RESEND ERR] HTTP " + response.statusCode() + " : " + response.body());
                }
            } catch (Exception e) {
                System.err.println(">>> [EMAIL RESEND WARN] " + e.getMessage());
            }
        }

        // 2. Repli SMTP (via application.properties : smtp.gmail.com)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println(">>> [EMAIL SMTP OK] Envoyé à : " + to);
        } catch (Exception e) {
            System.err.println(">>> [EMAIL WARN] Impossible d'envoyer l'email à " + to + " : " + e.getMessage());
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }

    // 1. Notification envoyée à l'Administrateur lors d'une nouvelle inscription
    public void notifierAdminNouvelleInscription(String userNom, String userPrenom, String userEmail, String userRole) {
        envoyerEmail(
                adminEmail,
                "Action requise : Nouveau compte en attente de vérification sur PFE Manager",
                "Bonjour Administrateur,\n\n" +
                "Un nouveau compte vient d'être créé sur PFE Manager et attend votre vérification :\n" +
                "- Nom complet : " + userPrenom + " " + userNom + "\n" +
                "- Email : " + userEmail + "\n" +
                "- Rôle demandé : " + userRole + "\n\n" +
                "Connectez-vous à votre espace Administration -> Gestion Utilisateurs pour approuver ou suspendre ce compte.\n\n" +
                "Cordialement,\nSystème PFE Manager."
        );
    }

    // 2. Confirmation envoyée à l'utilisateur à la création du compte (statut en attente)
    public void notifierUtilisateurInscriptionEnAttente(String userEmail, String userPrenom, String userNom) {
        envoyerEmail(
                userEmail,
                "Inscription reçue — Compte en attente de validation",
                "Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                "Votre demande de création de compte sur PFE Manager a bien été enregistrée.\n" +
                "Votre compte est actuellement en attente de vérification par l'administrateur.\n" +
                "Vous recevrez un email de confirmation dès qu'il sera validé et activé.\n\n" +
                "Cordialement,\nL'équipe PFE Manager."
        );
    }

    // 3. Notification envoyée à l'utilisateur lorsque l'Admin valide le compte
    public void notifierUtilisateurCompteApprouve(String userEmail, String userPrenom, String userNom) {
        envoyerEmail(
                userEmail,
                "Votre compte PFE Manager a été approuvé !",
                "Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                "Bonne nouvelle ! Votre compte sur PFE Manager a été validé par l'administrateur.\n" +
                "Vous pouvez dès maintenant accéder à votre espace en vous connectant avec votre adresse email et votre mot de passe.\n\n" +
                "Cordialement,\nL'équipe PFE Manager."
        );
    }

    // 4. Notification envoyée à l'utilisateur lorsque l'Admin suspend le compte
    public void notifierUtilisateurCompteSuspendu(String userEmail, String userPrenom, String userNom) {
        envoyerEmail(
                userEmail,
                "Mise à jour concernant votre compte PFE Manager",
                "Bonjour " + userPrenom + " " + userNom + ",\n\n" +
                "Nous vous informons que votre compte PFE Manager a été suspendu ou n'a pas été approuvé par l'administrateur.\n" +
                "Pour toute réclamation ou vérification complémentaire, veuillez contacter l'administration (" + adminEmail + ").\n\n" +
                "Cordialement,\nL'équipe PFE Manager."
        );
    }

    // 5. Notification envoyée à l'entreprise / labo lors d'une nouvelle candidature
    public void notifierOrganismeNouvelleCandidature(String destEmail, String organismeNom, String sujetTitre, User etudiant) {
        envoyerEmail(
                destEmail,
                "Nouvelle candidature PFE : " + sujetTitre,
                "Bonjour " + organismeNom + ",\n\n" +
                "Un étudiant vient de postuler à votre sujet de PFE :\n" +
                "- Sujet : " + sujetTitre + "\n" +
                "- Étudiant : " + etudiant.getPrenom() + " " + etudiant.getNom() + "\n" +
                "- Email : " + etudiant.getEmail() + "\n" +
                "- Téléphone : " + (etudiant.getTel() != null ? etudiant.getTel() : "Non renseigné") + "\n\n" +
                "Connectez-vous à votre espace PFE Manager (onglet 'Mes Sujets PFE') pour accepter ou refuser cette candidature.\n\n" +
                "Cordialement,\nSystème PFE Manager."
        );
    }

    // 6. Notification envoyée à l'étudiant lors de la décision sur sa candidature
    public void notifierEtudiantDecision(String etudiantEmail, String etudiantNom, String organismeNom, String sujetTitre, boolean accepte) {
        envoyerEmail(
                etudiantEmail,
                accepte ? "Candidature acceptée : " + sujetTitre : "Réponse à votre candidature : " + sujetTitre,
                "Bonjour " + etudiantNom + ",\n\n" +
                (accepte
                    ? "Bonne nouvelle ! Votre candidature pour le sujet \"" + sujetTitre + "\" a été ACCEPTÉE par " + organismeNom + ".\nCe sujet est désormais affecté à votre espace 'Mon Stage PFE'."
                    : "Nous vous informons que votre candidature pour le sujet \"" + sujetTitre + "\" n'a pas été retenue par " + organismeNom + ".\nVous pouvez postuler à d'autres offres sur le catalogue.") +
                "\n\nCordialement,\nSystème PFE Manager."
        );
    }
}