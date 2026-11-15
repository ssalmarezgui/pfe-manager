import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TokenService } from '@core/authentication';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
  ],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  statusMessage = '';
  statusType: 'pending' | 'error' = 'error';

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  login() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.statusMessage = '';
    this.cdr.detectChanges();

    this.http
      .post<any>('/api/auth/signin', {
        email: this.username.value,
        password: this.password.value,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          localStorage.setItem('auth-user', JSON.stringify(res));

          // Récupère le JWT quelle que soit la clé renvoyée par Spring Boot
          const jwt =
            res?.token ||
            res?.accessToken ||
            res?.access_token ||
            res?.jwt ||
            (typeof res === 'string' ? res : '');

          this.tokenService.set({
            access_token: jwt,
            token_type: 'Bearer',
          });

          this.cdr.detectChanges();
          this.router.navigateByUrl('/dashboard');
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting = false;
          if (err.status === 403) {
            this.statusType = 'pending';
            this.statusMessage =
              err.error?.message ||
              "Votre compte est suspendu ou en attente de validation par l'administrateur.";
          } else if (err.status === 401) {
            this.statusType = 'error';
            this.statusMessage = 'Email ou mot de passe incorrect.';
          } else {
            this.statusType = 'error';
            this.statusMessage = err.error?.message || 'Erreur lors de la connexion.';
          }
          this.cdr.detectChanges();
        },
      });
  }
}