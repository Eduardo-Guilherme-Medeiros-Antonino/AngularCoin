import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrencyService, HistoryItem } from '../../services/currency.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  historyList: HistoryItem[] = [];
  errorMessage: string | null = null;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadSavedHistory();
  }

  loadSavedHistory(): void {
    this.historyList = this.currencyService.getHistory();
  }

  clearHistory(): void {
    this.currencyService.clearHistory();
    this.historyList = [];
  }
}