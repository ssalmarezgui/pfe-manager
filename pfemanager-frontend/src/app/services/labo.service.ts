import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaboRecherche } from '../models/labo.model';

const API_URL = 'http://localhost:8080/api/labos';

@Injectable({
  providedIn: 'root'
})
export class LaboService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<LaboRecherche[]> {
    return this.http.get<LaboRecherche[]>(API_URL);
  }

  getById(id: number): Observable<LaboRecherche> {
    return this.http.get<LaboRecherche>(`${API_URL}/${id}`);
  }

  create(labo: LaboRecherche): Observable<LaboRecherche> {
    return this.http.post<LaboRecherche>(API_URL, labo);
  }

  update(id: number, labo: LaboRecherche): Observable<LaboRecherche> {
    return this.http.put<LaboRecherche>(`${API_URL}/${id}`, labo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}