import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class ProfileSettings implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

  currentUser: any = null;
  isSubmitting = false;

  userForm = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: [''],
    tel: ['', Validators.required],
    nouveauMotDePasse: [''],
  });

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (raw) {
      this.currentUser = JSON.parse(raw);
      this.userForm.patchValue({
        prenom: this.currentUser.prenom || '',
        nom: this.currentUser.nom || '',
        email: this.currentUser.email || '',
        tel: this.currentUser.tel || '',
      });
    }
  }

  sauvegarder(): void {
    if (this.userForm.invalid || !this.currentUser) return;

    this.isSubmitting = true;
    const formValue = this.userForm.value;

    // Payload épuré : on envoie uniquement les champs modifiables par le profil
    const payload: any = {
      id: this.currentUser.id,
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: this.currentUser.email,
      tel: formValue.tel,
    };

    // N'ajoute le mot de passe que s'il a été rempli
    if (formValue.nouveauMotDePasse && formValue.nouveauMotDePasse.trim()) {
      payload.password = formValue.nouveauMotDePasse;
    } else {
      payload.password = this.currentUser.password; // Conserve l'ancien si non modifié
    }

    this.http
      .put<any>(
        ` /api/users/${this.currentUser.id}`,
        payload,
        this.getHeaders()
      )
      .subscribe({
        next: (updatedUser) => {
          // Fusionner proprement avec l'utilisateur actuel
          const newUserData = {
            ...this.currentUser,
            ...updatedUser,
            name: `${payload.prenom} ${payload.nom}`,
          };

          localStorage.setItem('auth-user', JSON.stringify(newUserData));
          if (sessionStorage.getItem('auth-user')) {
            sessionStorage.setItem('auth-user', JSON.stringify(newUserData));
          }

          this.isSubmitting = false;
          this.snackBar.open('Profil mis à jour avec succès !', 'Fermer', {
            duration: 3000,
          });

          setTimeout(() => {
            this.router.navigateByUrl('/profile/overview');
          }, 500);
        },
        error: (err) => {
          console.error('Erreur API Put User:', err);
          this.isSubmitting = false;
          this.snackBar.open('Erreur lors de la mise à jour sur le serveur.', 'Fermer', {
            duration: 3500,
          });
        },
      });
  }
}