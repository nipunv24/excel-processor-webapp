// src/app/institution-manager/institution-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../services/excel.service';

interface Institution {
  institution_name: string;
  employees: any[];
}

@Component({
  selector: 'app-institution-manager',
  templateUrl: './institution-manager.component.html',
  styleUrls: ['./institution-manager.component.css'],
  standalone: false
})
export class InstitutionManagerComponent implements OnInit {
  institutionName: string = '';
  selectedInstitution: string = '';
  nic: string = '';
  accountNo: string = '';
  employeeName: string = '';
  capital: number | null = null;
  interest: number | null = null;
  employees: { [nic: string]: { name: string; accountNo: string; capital: number | null; interest: number | null } } = {};
  institutions: Institution[] = [];
  loading: boolean = false;
  
  // Success/error message handling
  message: string = '';
  isError: boolean = false;

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

  addInstitution() {
    if (!this.institutionName.trim()) {
      this.showError('Institution name cannot be empty!');
      return;
    }

    this.excelService.addInstitution(this.institutionName).subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Institution added successfully!');
        this.institutionName = ''; // Clear the input field
        this.loadInstitutions(); // Reload institutions to update dropdown
      },
      error: (err) => {
        this.showError(err.error?.error || 'Failed to add institution');
      }
    });
  }

  addEmployeeToList() {
    if (!this.selectedInstitution) {
      this.showError('Please select an institution first!');
      return;
    }

    if (!this.nic.trim() || !this.employeeName.trim() || !this.accountNo.trim()) {
      this.showError('NIC, Account No, and name are required!');
      return;
    }

    // Check if this NIC already exists in the list
    if (this.employees[this.nic]) {
      this.showError('An employee with this NIC already exists in the list');
      return;
    }

    this.employees[this.nic] = {
      name: this.employeeName,
      accountNo: this.accountNo,
      capital: this.capital,
      interest: this.interest
    };
    
    this.nic = '';
    this.accountNo = '';
    this.employeeName = '';
    this.capital = null;
    this.interest = null;
    this.message = ''; // Clear any previous messages
  }

  removeEmployeeFromList(nic: string) {
    if (this.employees[nic]) {
      delete this.employees[nic];
    }
  }

  submitEmployees() {
    if (!this.selectedInstitution) {
      this.showError('Please select an institution first.');
      return;
    }

    if (Object.keys(this.employees).length === 0) {
      this.showError('Please add at least one employee.');
      return;
    }

    this.excelService.addEmployees(this.selectedInstitution, this.employees).subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Employees added successfully!');
        this.employees = {}; // Reset after success
      },
      error: (err) => {
        this.showError(err.error?.error || 'Failed to add employees');
      }
    });
  }

  get employeeKeys(): string[] {
    return Object.keys(this.employees);
  }

  private showSuccess(msg: string) {
    this.message = msg;
    this.isError = false;
    // Auto-hide the message after 5 seconds
    setTimeout(() => this.message = '', 5000);
  }

  private showError(msg: string) {
    this.message = msg;
    this.isError = true;
    // Auto-hide the message after 5 seconds
    setTimeout(() => this.message = '', 5000);
  }
}