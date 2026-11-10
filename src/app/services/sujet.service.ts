import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SujetPFE, SujetPFERequest } from '../models/sujet.model';

const API_URL = 'http://localhost:8080/api/sujets';

@Injectable({
  providedIn: 'root'
})
export class SujetService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(API_URL);
  }

  getValides(): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${API_URL}/valides`);
  }

  getEnAttente(): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${API_URL}/en-attente`);
  }

  getByEntreprise(id: number): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${API_URL}/entreprise/${id}`);
  }

  getByLabo(id: number): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${API_URL}/labo/${id}`);
  }

  getByEtudiant(id: number): Observable<SujetPFE[]> {
    return this.http.get<SujetPFE[]>(`${API_URL}/etudiant/${id}`);
  }

  search(keyword?: string, technologie?: string): Observable<SujetPFE[]> {
    let params: any = {};
    if (keyword) params.keyword = keyword;
    if (technologie) params.technologie = technologie;
    return this.http.get<SujetPFE[]>(`${API_URL}/search`, { params });
  }

  create(sujet: SujetPFERequest): Observable<SujetPFE> {
    return this.http.post<SujetPFE>(API_URL, sujet);
  }

  update(id: number, sujet: SujetPFERequest): Observable<SujetPFE> {
    return this.http.put<SujetPFE>(`${API_URL}/${id}`, sujet);
  }

  valider(id: number): Observable<SujetPFE> {
    return this.http.patch<SujetPFE>(`${API_URL}/${id}/valider`, {});
  }

  refuser(id: number): Observable<SujetPFE> {
    return this.http.patch<SujetPFE>(`${API_URL}/${id}/refuser`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}