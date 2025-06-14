// src/app/services/excel.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface EmployeeData {
  name: string;
  accountNo: string;
  capital: number | null;
  interest: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private baseUrl = environment.BACKEND_HOST; // Base URL for Flask API
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Institution Management APIs
  addInstitution(institution_name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addInstitution`, 
      { institution_name }, 
      this.httpOptions
    );
  }

  getInstitutions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getInstitutions`, this.httpOptions);
  }

  deleteInstitution(institution_name: string): Observable<any> {
    const options = {
      headers: this.httpOptions.headers,
      body: { institution_name }
    };
    return this.http.delete<any>(`${this.baseUrl}/deleteInstitution`, options);
  }

  // Employee Management APIs
  addEmployees(institution_name: string, employees: Record<string, EmployeeData>): Observable<any> {
    const payload = { institution_name, employees };
    return this.http.post<any>(`${this.baseUrl}/addEmployees`, payload, this.httpOptions);
  }

  deleteEmployee(institution_name: string, employee_id: string): Observable<any> {
    const options = {
      headers: this.httpOptions.headers,
      body: { institution_name, employee_id }
    };
    return this.http.delete<any>(`${this.baseUrl}/deleteEmployee`, options);
  }

  // Payment APIs (for Task 2)
  submitPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submitPayment`, paymentData, this.httpOptions);
  }

  submitBatchPayment(batchData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submitExcelBatchPayment`, batchData, this.httpOptions);
  }

  // Edit Institution API
  editInstitution(old_institution_name: string, new_institution_name: string): Observable<any> {
    const payload = { old_institution_name, new_institution_name };
    return this.http.put<any>(`${this.baseUrl}/editInstitution`, payload, this.httpOptions);
  }

  // Edit Employee API
  editEmployee(institution_name: string, employee_id: string, employee_data: EmployeeData): Observable<any> {
    const payload = { institution_name, employee_id, employee_data };
    return this.http.put<any>(`${this.baseUrl}/editEmployee`, payload, this.httpOptions);
  }
}