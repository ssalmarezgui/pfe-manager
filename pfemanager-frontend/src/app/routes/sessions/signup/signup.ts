import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './signup.html',
})
export class Signup implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  entreprises: any[] = [];
  labos: any[] = [];
  isSubmitting = false;
  errorMessage = '';

  signupForm = this.fb.nonNullable.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    tel: ['', [Validators.required]],
    role: ['etudiant', [Validators.required]],
    idEntreprise: [null as number | null],
    idLabo: [null as number | null],
  });

  ngOnInit(): void {
    // Charger les entreprises et les labos pour les listes deroulantes
    this.http.get<any[]>('/api/entreprises').subscribe({
      next: (data) => (this.entreprises = data || []),
    });
    this.http.get<any[]>('/api/labos').subscribe({
      next: (data) => (this.labos = data || []),
    });
  }

  register(): void {
    if (this.signupForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.http.post('/api/auth/signup', this.signupForm.value).subscribe({
      next: () => {
        alert('Compte cree avec succes ! Vous pouvez maintenant vous connecter.');
        this.router.navigateByUrl('/auth/login');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        this.isSubmitting = false;
      },
    });
  }
}