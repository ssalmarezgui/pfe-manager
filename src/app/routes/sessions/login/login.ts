import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslatePipe } from '@ngx-translate/core';
import { TokenService } from '@core/authentication';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    FormsModule,
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
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly permissionsService = inject(NgxPermissionsService);

  isSubmitting = false;

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  remplirAdmin() {
    this.loginForm.patchValue({ username: 'admin@pfemanager.com', password: 'admin123' });
  }

  remplirEtudiant() {
    this.loginForm.patchValue({ username: 'yassine.etudiant@ensi-uma.tn', password: 'password123' });
  }

  remplirEntreprise() {
    this.loginForm.patchValue({ username: 'sami.rh@smartsoft.tn', password: 'password123' });
  }

  get username() {
    return this.loginForm.get('username')!;
  }

  // AJOUTÉ ICI :
  get password() {
    return this.loginForm.get('password')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  login() {
    this.isSubmitting = true;

    this.http.post<any>('http://localhost:8080/api/auth/signin', {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    }).subscribe({
      next: (res) => {
        sessionStorage.setItem('auth-token', res.token);
        sessionStorage.setItem('auth-user', JSON.stringify(res));

        localStorage.clear();

        this.permissionsService.loadPermissions(res.roles);

        try {
          this.tokenService.set({ access_token: res.token, token_type: 'Bearer' });
        } catch (e) {}

        this.isSubmitting = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        alert('Erreur : Email ou mot de passe incorrect !');
        this.isSubmitting = false;
      },
    });
  }
}