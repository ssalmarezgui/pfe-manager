import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/authentication';


@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: false,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  isSubmitting = false;
  statusMessage = '';
  statusType: 'pending' | 'error' = 'error';

  loginForm = this.fb.nonNullable.group({
    username: ['ng-matero', [Validators.required]],
    password: ['ng-matero', [Validators.required]],
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
    this.isSubmitting = true;

    this.auth
      .login(this.username.value, this.password.value, this.rememberMe.value)
      .pipe(filter(authenticated => authenticated))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
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
        }
      });
  }
}
