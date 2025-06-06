// src/app/institution-list/institution-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../services/excel.service';

interface Employee {
  id: string;
  name: string;
  accountNo: string;
}

interface Institution {
  institution_name: string;
  employees: Employee[];
}

@Component({
  selector: 'app-institution-list',
  templateUrl: './institution-list.component.html',
  styleUrls: ['./institution-list.component.css'],
  standalone: false
})
export class InstitutionListComponent implements OnInit {
  institutions: Institution[] = [];
  message: string = '';
  isError: boolean = false;
  loading: boolean = false;

  constructor(private excelService: ExcelService) {}

  ngOnInit(): void {
    this.loadInstitutions();
  }

  loadInstitutions(): void {
    this.loading = true;
    this.excelService.getInstitutions().subscribe({
      next: (res) => {
        this.institutions = res.institutions;
        this.loading = false;
      },
      error: (err) => {
        this.showError('Failed to load institutions: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  deleteInstitution(institutionName: string): void {
    if (confirm(`Are you sure you want to delete institution "${institutionName}"?`)) {
      this.loading = true;
      this.excelService.deleteInstitution(institutionName).subscribe({
        next: (res) => {
          this.showSuccess('Institution deleted successfully!');
          this.loadInstitutions(); // Reload the list
        },
        error: (err) => {
          this.showError('Failed to delete institution: ' + (err.error?.error || 'Unknown error'));
          this.loading = false;
        }
      });
    }
  }

  deleteEmployee(institutionName: string, employeeId: string, employeeName: string): void {
    if (confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      this.loading = true;
      this.excelService.deleteEmployee(institutionName, employeeId).subscribe({
        next: (res) => {
          this.showSuccess('Employee deleted successfully!');
          this.loadInstitutions(); // Reload the list
        },
        error: (err) => {
          this.showError('Failed to delete employee: ' + (err.error?.error || 'Unknown error'));
          this.loading = false;
        }
      });
    }
  }

  private showSuccess(msg: string): void {
    this.message = msg;
    this.isError = false;
    setTimeout(() => this.message = '', 5000);
  }

  private showError(msg: string): void {
    this.message = msg;
    this.isError = true;
    setTimeout(() => this.message = '', 5000);
  }
}