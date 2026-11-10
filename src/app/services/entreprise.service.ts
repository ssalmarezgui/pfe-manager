import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entreprise } from '../models/entreprise.model';

const API_URL = 'http://localhost:8080/api/entreprises';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(API_URL);
  }

  getById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${API_URL}/${id}`);
  }

  create(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(API_URL, entreprise);
  }

  update(id: number, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${API_URL}/${id}`, entreprise);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}