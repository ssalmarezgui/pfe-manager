import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { Menu } from '@core';
import { Token, User } from './interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);

  login(username: string, password: string, rememberMe = false) {
    return this.http.post<any>('/api/auth/signin', { email: username, password }).pipe(
      map((res) => {
        if (res) {
          localStorage.setItem('auth-user', JSON.stringify(res));
        }
        return {
          access_token: res.token || res.accessToken || res.access_token,
          token_type: 'Bearer',
        } as Token;
      })
    );
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>('/api/auth/refresh', params);
  }

  logout() {
    return this.http.post<any>('/api/auth/signout', {});
  }

  user() {
    return this.http.get<User>('/api/auth/user');
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>('data/menu.json?_t=' + Date.now()).pipe(map(res => res.menu));
  }
}