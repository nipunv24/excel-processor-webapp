import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../services/excel.service';
import { LineNumberService } from '../services/line-number.service';

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

interface BatchEmployee {
  id: number;
  name: string;
  accNo: string;
  institution: string;
  capitalAmount: number | null;
  interestAmount: number | null;
  bankName: string;
  description: string;
}

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css'],
  standalone: false
})
export class PaymentFormComponent implements OnInit {
  // Individual Payment Properties
  institutions: Institution[] = [];
  selectedInstitution: string = '';
  selectedEmployee: Employee | null = null;
  capitalAmount: string = '';
  interestAmount: string = '';
  billNo: string = '';
  cheqNo: string = '';
  accNo: string = '';
  bankName: string = '';
  description: string = '';

  // Batch Payment Properties
  activeTab: 'individual' | 'batch' = 'individual';
  selectedBatchInstitution: string = '';
  selectedEmployees: Set<string> = new Set(); // Store selected employee unique keys
  batchBankName: string = '';
  batchDescription: string = '';
  batchEmployees: BatchEmployee[] = [];
  batchCounter: number = 1;

  // Common Properties
  message: string = '';
  isError: boolean = false;
  loading: boolean = false;
  bankNames: string[] = ['Peoples Bank', 'HNB', 'Cash in Hand'];

  constructor(
    private excelService: ExcelService,
    private lineNumberService: LineNumberService
  ) {}

  ngOnInit(): void {
    this.loadInstitutions();
  }

  setActiveTab(tab: 'individual' | 'batch'): void {
    this.activeTab = tab;
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

  getEmployeesForInstitution(): Employee[] {
    if (!this.selectedInstitution && !this.selectedBatchInstitution) return [];
    
    const institution = this.institutions.find(inst => 
      inst.institution_name === (this.activeTab === 'individual' ? this.selectedInstitution : this.selectedBatchInstitution));
    
    return institution ? institution.employees : [];
  }

  onInstitutionChange(): void {
    this.selectedEmployee = null;
  }

  onBatchInstitutionChange(): void {
    this.selectedEmployees.clear();
  }

  // Generate unique key for each employee to avoid conflicts
  getEmployeeUniqueKey(employee: Employee): string {
    return `${employee.id}_${employee.accountNo}`;
  }

  isEmployeeSelected(employee: Employee): boolean {
    return this.selectedEmployees.has(this.getEmployeeUniqueKey(employee));
  }

  toggleEmployeeSelection(employee: Employee): void {
    const uniqueKey = this.getEmployeeUniqueKey(employee);
    if (this.selectedEmployees.has(uniqueKey)) {
      this.selectedEmployees.delete(uniqueKey);
    } else {
      this.selectedEmployees.add(uniqueKey);
    }
  }

  hasSelectedEmployees(): boolean {
    return this.selectedEmployees.size > 0;
  }

  selectAllEmployees(): void {
    const employees = this.getEmployeesForInstitution();
    employees.forEach(employee => {
      const uniqueKey = this.getEmployeeUniqueKey(employee);
      this.selectedEmployees.add(uniqueKey);
    });
  }

  deselectAllEmployees(): void {
    this.selectedEmployees.clear();
  }

  toggleSelectAll(event: any): void {
  if (event.target.checked) {
    this.selectAllEmployees();
  } else {
    this.deselectAllEmployees();
  }
}

  areAllEmployeesSelected(): boolean {
    const employees = this.getEmployeesForInstitution();
    if (employees.length === 0) return false;
    
    return employees.every(employee => 
      this.selectedEmployees.has(this.getEmployeeUniqueKey(employee))
    );
  }

  addSelectedEmployeesToBatch(): void {
    if (!this.selectedBatchInstitution || this.selectedEmployees.size === 0) return;

    const institution = this.institutions.find(inst => 
      inst.institution_name === this.selectedBatchInstitution
    );

    if (!institution) return;

    // Add each selected employee to the batch
    institution.employees.forEach(employee => {
      const uniqueKey = this.getEmployeeUniqueKey(employee);
      if (this.selectedEmployees.has(uniqueKey)) {
        const batchEmployee: BatchEmployee = {
          id: this.batchCounter++,
          name: employee.name,
          accNo: employee.accountNo || '',
          institution: this.selectedBatchInstitution,
          capitalAmount: employee.capital || null,
          interestAmount: employee.interest || null,
          bankName: this.batchBankName,
          description: this.batchDescription
        };

        this.batchEmployees.push(batchEmployee);
      }
    });

    // Clear selections after adding to batch
    this.selectedEmployees.clear();
  }

  removeFromBatchList(index: number): void {
    this.batchEmployees.splice(index, 1);
  }

  submitPayment(): void {
    if (!this.selectedInstitution || !this.selectedEmployee || 
        !this.cheqNo || !this.accNo || (!this.capitalAmount && !this.interestAmount)) {
      this.showError('Institution, Employee, Bill No, Cheq No, and Acc No are required. Either Capital or Interest amount must be provided.');
      return;
    }

    const columnNameRow = this.lineNumberService.getColumnNameRow();
    const firstEntry = this.lineNumberService.getFirstEntry();
    const date = this.lineNumberService.getTodayDate();
    const ledger_debit_column = this.lineNumberService.getLedgerDebitColumn();
    const ledger_interest_column = this.lineNumberService.getLedgerInterestColumn();

    const paymentData = {
      institute: this.selectedInstitution,
      employee: this.selectedEmployee,
      capitalAmount: this.capitalAmount || null,
      interestAmount: this.interestAmount || null,
      billNo: this.billNo || null,
      cheqNo: this.cheqNo,
      accNo: this.accNo,
      bankName: this.bankName,
      description: this.description,
      columnNameRow: columnNameRow,
      firstEntry: firstEntry,
      date: date,
      ledger_debit_column: ledger_debit_column,
      ledger_interest_column: ledger_interest_column
    };

    this.loading = true;
    this.excelService.submitPayment(paymentData).subscribe({
      next: (res) => {
        this.showSuccess('Payment submitted successfully!');
        this.resetForm();
        this.loading = false;
      },
      error: (err) => {
        this.showError('Failed to submit payment: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  submitBatchPayment(): void {
    if (this.batchEmployees.length === 0) {
      this.showError('Please add at least one employee to the batch.');
      return;
    }

    // Validate that each employee has either capital or interest amount
    const invalidEmployee = this.batchEmployees.find(emp => 
      !emp.capitalAmount && !emp.interestAmount
    );

    if (invalidEmployee) {
      this.showError(`Please provide either capital or interest amount for ${invalidEmployee.name}`);
      return;
    }

    const columnNameRow = this.lineNumberService.getColumnNameRow();
    const firstEntry = this.lineNumberService.getFirstEntry();
    const date = this.lineNumberService.getTodayDate();
    const ledger_debit_column = this.lineNumberService.getLedgerDebitColumn();
    const ledger_interest_column = this.lineNumberService.getLedgerInterestColumn();

    // Format the batch data according to the expected structure
    const batchData = {
      date: date,
      first_entry: firstEntry,
      columnNameRow: columnNameRow,
      ledger_debit_column: ledger_debit_column,
      ledger_interest_column: ledger_interest_column,
      employees: this.batchEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        accNo: emp.accNo,
        institution: emp.institution,
        capitalAmount: emp.capitalAmount,
        interestAmount: emp.interestAmount,
        bankName: emp.bankName,
        description: emp.description
      }))
    };

    console.log('Sending batch data:', batchData); // Add logging to debug

    this.loading = true;
    this.excelService.submitBatchPayment(batchData).subscribe({
      next: (res) => {
        this.showSuccess('Batch payment submitted successfully!');
        this.resetBatchForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Batch payment error:', err); // Add error logging
        this.showError('Failed to submit batch payment: ' + (err.error?.error || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.selectedInstitution = '';
    this.selectedEmployee = null;
    this.capitalAmount = '';
    this.interestAmount = '';
    this.billNo = '';
    this.cheqNo = '';
    this.accNo = '';
    this.bankName = '';
    this.description = '';
  }

  resetBatchForm(): void {
    this.selectedBatchInstitution = '';
    this.selectedEmployees.clear();
    this.batchBankName = '';
    this.batchDescription = '';
    this.batchEmployees = [];
    this.batchCounter = 1;
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