import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Transaction,
  CreateTransactionRequest
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;


  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }


  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }


  getTransactionByIdTransaction(idTransaction: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/id-transaction/${idTransaction}`);
  }


  getTransactionsByCompte(compteId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/compte/${compteId}`);
  }


  getRecentTransactions(days: number = 7): Observable<Transaction[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent`, { params });
  }


  createTransaction(data: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }
}
