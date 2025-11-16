import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Compte,
  CreateCompteRequest,
  CompteDetails
} from '../models/compte.model';

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comptes`;


  getAllComptes(active?: boolean): Observable<Compte[]> {
    let params = new HttpParams();
    if (active !== undefined) {
      params = params.set('active', active);
    }
    return this.http.get<Compte[]>(this.apiUrl, { params });
  }


  getCompteById(id: string): Observable<Compte> {
    return this.http.get<Compte>(`${this.apiUrl}/${id}`);
  }


  getCompteByNumero(numeroCompte: string): Observable<Compte> {
    return this.http.get<Compte>(`${this.apiUrl}/numero/${numeroCompte}`);
  }


  getComptesByClient(clientId: string): Observable<Compte[]> {
    return this.http.get<Compte[]>(`${this.apiUrl}/client/${clientId}`);
  }


  getCompteDetails(id: string): Observable<CompteDetails> {
    return this.http.get<CompteDetails>(`${this.apiUrl}/${id}/details`);
  }


  createCompte(data: CreateCompteRequest): Observable<Compte> {
    return this.http.post<Compte>(this.apiUrl, data);
  }


  deleteCompte(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
