import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// Here line number stands for the line containing the column names.
// Here first line stands for the line where we are willing to locate the first entry.

export class LineNumberService {
  private columnNameRowSubject = new BehaviorSubject<number>(0); // Default line number 0
  columnNameRow$ = this.columnNameRowSubject.asObservable();

  private firstEntrySubject = new BehaviorSubject<number>(0); // Default line number 0
  firstEntry$ = this.firstEntrySubject.asObservable();

  private todayDateSubject = new BehaviorSubject<string>(''); // Default: empty string
  todayDate$ = this.todayDateSubject.asObservable();

  private ledgerDebitColumnSubject = new BehaviorSubject<string>(''); // Default: empty string
  ledgerDebitColumn$ = this.ledgerDebitColumnSubject.asObservable();

  private ledgerInterestColumnSubject = new BehaviorSubject<string>(''); // Default: empty string
  ledgerInterestColumn$ = this.ledgerInterestColumnSubject.asObservable();

  

  setColumnNameRow(value: number): void {
    this.columnNameRowSubject.next(value);
  }

  getColumnNameRow(): number {
    return this.columnNameRowSubject.getValue();
  }

  setFirstEntry(value: number): void {
    this.firstEntrySubject.next(value);
  }

  getFirstEntry(): number {
    return this.firstEntrySubject.getValue();
  }

  setTodayDate(value: string): void { // Accepts string now
    this.todayDateSubject.next(value);
  }

  getTodayDate(): string { // Returns string now
    return this.todayDateSubject.getValue();
  }

  setLedgerDebitColumn(value: string): void {
    this.ledgerDebitColumnSubject.next(value);
  }

  getLedgerDebitColumn(): string {
    return this.ledgerDebitColumnSubject.getValue();
  }   

  setLedgerInterestColumn(value: string): void {
    this.ledgerInterestColumnSubject.next(value);
  } 

  getLedgerInterestColumn(): string {
    return this.ledgerInterestColumnSubject.getValue();
  } 
  
}
