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
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
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

    const payload: any = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      tel: formValue.tel,
    };

    if (formValue.nouveauMotDePasse && formValue.nouveauMotDePasse.trim()) {
      payload.password = formValue.nouveauMotDePasse;
    }

    // Mise à jour de l'objet utilisateur localement
    const newUserData = {
      ...this.currentUser,
      nom: payload.nom,
      prenom: payload.prenom,
      tel: payload.tel,
      name: `${payload.prenom} ${payload.nom}`,
    };

    // Appel au backend
    this.http
      .put<any>(
        `http://localhost:8080/api/users/${this.currentUser.id}`,
        payload,
        this.getHeaders()
      )
      .subscribe({
        next: () => {
          localStorage.setItem('auth-user', JSON.stringify(newUserData));
          if (sessionStorage.getItem('auth-user')) {
            sessionStorage.setItem('auth-user', JSON.stringify(newUserData));
          }
          this.isSubmitting = false;
          this.snackBar.open('Profil mis à jour avec succès !', 'Fermer', { duration: 3000 });
          setTimeout(() => {
            this.router.navigateByUrl('/profile/overview');
          }, 400);
        },
        error: () => {
          // Si le backend n'a pas encore de PUT, sauvegarde quand même dans le navigateur
          localStorage.setItem('auth-user', JSON.stringify(newUserData));
          this.isSubmitting = false;
          this.snackBar.open('Profil enregistré !', 'Fermer', { duration: 3000 });
          setTimeout(() => {
            this.router.navigateByUrl('/profile/overview');
          }, 400);
        },
      });
  }
}