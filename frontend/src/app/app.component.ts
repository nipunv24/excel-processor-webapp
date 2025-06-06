import { Component } from '@angular/core';
import { LineNumberService } from './services/line-number.service'; // Import the service

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  title = 'Institution Management System';

  columnNameRow: number = 0;
  firstEntry: number = 0;
  todayDate: string = '';

  constructor(private lineNumberService: LineNumberService) {}

  updateColumnNameRow(): void {
    this.lineNumberService.setColumnNameRow(this.columnNameRow);
  }

  updateFirstEntry(): void {
    this.lineNumberService.setFirstEntry(this.firstEntry);
  }

  updateTodayDate(): void {
    this.lineNumberService.setTodayDate(this.todayDate);
  }
}