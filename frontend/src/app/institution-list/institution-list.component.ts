import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../services/excel.service';

interface Employee {
  id: string;
  name: string;
  accountNo: string;
  capital?: number | null;
  interest?: number | null;
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

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math; 

  // Modal properties
  showEditInstitutionModal: boolean = false;
  showEditEmployeeModal: boolean = false;
    
  // Edit data
  editInstitutionData = {
    oldName: '',
    newName: ''
  };
    
  editEmployeeData = {
    institutionName: '',
    employeeId: '',
    name: '',
    accountNo: '',
    capital: null as number | null,
    interest: null as number | null
  };

  get sortedInstitutions(): Institution[] {
    return this.institutions.sort((a, b) => 
      a.institution_name.localeCompare(b.institution_name)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.sortedInstitutions.length / this.itemsPerPage);
  }

  get paginatedInstitutions(): Institution[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.sortedInstitutions.slice(startIndex, endIndex);
  }

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
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }
      },
      error: (err) => {
        this.showError('Failed to load institutions: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const visiblePages: number[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages <= 7
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis logic
      if (currentPage <= 4) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          visiblePages.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        // Show current page with 2 neighbors on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          visiblePages.push(i);
        }
      }
    }
    
    return visiblePages;
  }

  onPageSizeChange(): void {
    // Reset to first page when page size changes
    this.currentPage = 1;
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

  // Edit Institution Methods
  openEditInstitutionModal(institutionName: string): void {
    this.editInstitutionData.oldName = institutionName;
    this.editInstitutionData.newName = institutionName;
    this.showEditInstitutionModal = true;
  }

  closeEditInstitutionModal(): void {
    this.showEditInstitutionModal = false;
    this.editInstitutionData = { oldName: '', newName: '' };
  }

  saveInstitutionEdit(): void {
    if (!this.editInstitutionData.newName.trim()) {
      this.showError('Institution name cannot be empty');
      return;
    }

    this.loading = true;
    this.excelService.editInstitution(
      this.editInstitutionData.oldName,
      this.editInstitutionData.newName
    ).subscribe({
      next: (res) => {
        this.showSuccess('Institution name updated successfully!');
        this.closeEditInstitutionModal();
        this.loadInstitutions();
      },
      error: (err) => {
        this.showError('Failed to update institution: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  // Edit Employee Methods
  openEditEmployeeModal(institutionName: string, employee: Employee): void {
    this.editEmployeeData = {
      institutionName: institutionName,
      employeeId: employee.id,
      name: employee.name,
      accountNo: employee.accountNo,
      capital: (employee as any).capital || null,
      interest: (employee as any).interest || null
    };
    this.showEditEmployeeModal = true;
  }

  closeEditEmployeeModal(): void {
    this.showEditEmployeeModal = false;
    this.editEmployeeData = {
      institutionName: '',
      employeeId: '',
      name: '',
      accountNo: '',
      capital: null,
      interest: null
    };
  }

  saveEmployeeEdit(): void {
    if (!this.editEmployeeData.name.trim() || !this.editEmployeeData.accountNo.trim()) {
      this.showError('Name and Account Number are required');
      return;
    }

    this.loading = true;
    const employeeData = {
      name: this.editEmployeeData.name,
      accountNo: this.editEmployeeData.accountNo,
      capital: this.editEmployeeData.capital,
      interest: this.editEmployeeData.interest
    };

    this.excelService.editEmployee(
      this.editEmployeeData.institutionName,
      this.editEmployeeData.employeeId,
      employeeData
    ).subscribe({
      next: (res) => {
        this.showSuccess('Employee data updated successfully!');
        this.closeEditEmployeeModal();
        this.loadInstitutions();
      },
      error: (err) => {
        this.showError('Failed to update employee: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  private showSuccess(msg: string): void {
    this.message = msg;
    this.isError = false;
    setTimeout(() => this.message = '', 15000);
  }

  private showError(msg: string): void {
    this.message = msg;
    this.isError = true;
    setTimeout(() => this.message = '', 15000);
  }
}