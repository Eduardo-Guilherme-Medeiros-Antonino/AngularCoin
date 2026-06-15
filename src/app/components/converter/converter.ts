import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './converter.html',
  styleUrl: './converter.css'
})
export class Converter implements OnInit {
  amount: number | null = null;
  fromCurrency: string = 'BRL';
  toCurrency: string = 'USD';

  allCurrencies: string[] = [];
  filteredFromCurrencies: string[] = [];
  filteredToCurrencies: string[] = [];
  searchFrom: string = '';
  searchTo: string = '';

  isConverted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  isOfflineMode: boolean = false;

  computedAmountOriginal: string = '';
  computedResultValue: string = '';

  private currencyLabelGenerator = new Intl.DisplayNames(['pt-BR'], { type: 'currency' });

  constructor(
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.prefetchRates();
  }

  getCurrencyLabel(code: string): string {
    try {
      const name = this.currencyLabelGenerator.of(code);
      if (name && name.toLowerCase() !== code.toLowerCase()) {
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        return `${code} - ${formattedName}`;
      }
      return code;
    } catch {
      return code;
    }
  }

  prefetchRates(): void {
    this.errorMessage = null;
    this.isOfflineMode = !navigator.onLine;

    this.currencyService.getRates(this.fromCurrency).subscribe({
      next: (rates) => {
        if (rates) {
          this.allCurrencies = Object.keys(rates).sort();
          this.filterFromList();
          this.filterToList();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  filterFromList(): void {
    const searchLog = this.searchFrom.toLowerCase();
    this.filteredFromCurrencies = this.allCurrencies.filter(c => {
      const fullLabel = this.getCurrencyLabel(c).toLowerCase();
      return fullLabel.includes(searchLog);
    });

    if (this.filteredFromCurrencies.length > 0 && !this.filteredFromCurrencies.includes(this.fromCurrency)) {
      this.fromCurrency = this.filteredFromCurrencies[0];
      this.prefetchRates();
    }
  }

  filterToList(): void {
    const searchLog = this.searchTo.toLowerCase();
    this.filteredToCurrencies = this.allCurrencies.filter(c => {
      const fullLabel = this.getCurrencyLabel(c).toLowerCase();
      return fullLabel.includes(searchLog);
    });

    if (this.filteredToCurrencies.length > 0 && !this.filteredToCurrencies.includes(this.toCurrency)) {
      this.toCurrency = this.filteredToCurrencies[0];
    }
  }

  invertCurrencies(): void {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;

    this.searchFrom = '';
    this.searchTo = '';

    if (this.isConverted) {
      this.handleConvert();
    } else {
      this.prefetchRates();
    }
  }

  goToHistory(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/history']).then(() => {
      this.cdr.detectChanges();
    });
  }

  handleConvert(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    // Validação do campo de valor vazio, menor ou igual a zero
    if (!this.amount || this.amount <= 0) {
      this.errorMessage = 'Por favor, insira um valor válido maior que zero para realizar a conversão.';
      this.isConverted = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.isOfflineMode = !navigator.onLine;

    this.currencyService.getRates(this.fromCurrency).subscribe({
      next: (rates) => {
        if (rates && rates[this.toCurrency] !== undefined) {
          const rate = rates[this.toCurrency];
          const convertedAmount = this.amount! * rate;
          
          this.computedAmountOriginal = `${this.amount!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${this.fromCurrency}`;
          this.computedResultValue = `${convertedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${this.toCurrency}`;
          
          const rateText = `1 ${this.fromCurrency} = ${rate.toFixed(4)} ${this.toCurrency}`;
          this.currencyService.addHistoryItem(this.computedAmountOriginal, this.computedResultValue, rateText);
          
          this.isConverted = true;
        } else {
          this.errorMessage = 'Moeda de destino não suportada.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        this.isConverted = false;
        this.cdr.detectChanges();
      }
    });
  }
}