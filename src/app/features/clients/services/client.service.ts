import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest
} from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;


  getAllClients(active?: boolean, search?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (active !== undefined) {
      params = params.set('active', active);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Client[]>(this.apiUrl, { params });
  }


  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }


  createClient(data: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, data);
  }


  updateClient(id: string, data: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, data);
  }


  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
