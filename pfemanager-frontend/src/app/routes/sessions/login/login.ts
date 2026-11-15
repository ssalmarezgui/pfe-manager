import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/authentication';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
    TranslatePipe,
  ],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

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

    this.auth.login(this.username.value, this.password.value, this.rememberMe.value).subscribe({
      next: (authenticated) => {
        this.isSubmitting = false;
        if (authenticated) {
          this.router.navigateByUrl('/');
        }
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
      },
    });
  }
}