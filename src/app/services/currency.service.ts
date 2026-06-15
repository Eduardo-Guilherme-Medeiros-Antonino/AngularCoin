import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface HistoryItem {
  id: number;
  date: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
}

interface ExchangeResponse {
  result: string;
  rates: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private baseUrl = 'https://open.er-api.com/v6/latest';

  constructor(private http: HttpClient) {}

  getRates(baseCurrency: string): Observable<{ [key: string]: number }> {
    // Se estiver offline, tenta carregar as últimas taxas salvas localmente
    if (!navigator.onLine) {
      const cachedData = localStorage.getItem(`rates_${baseCurrency}`);
      if (cachedData) {
        return of(JSON.parse(cachedData));
      }
      return throwError(() => new Error('Você está offline e não há dados salvos para esta moeda.'));
    }

    return this.http.get<ExchangeResponse>(`${this.baseUrl}/${baseCurrency}`).pipe(
      map(response => {
        if (response.result === 'success') {
          return response.rates;
        }
        throw new Error('Erro ao carregar taxas.');
      }),
      // Salva em cache para o modo offline se a requisição der certo
      tap(rates => {
        localStorage.setItem(`rates_${baseCurrency}`, JSON.stringify(rates));
      }),
      catchError(error => {
        // Fallback caso a API caia mas exista cache local
        const cachedData = localStorage.getItem(`rates_${baseCurrency}`);
        if (cachedData) {
          return of(JSON.parse(cachedData));
        }
        return throwError(() => new Error('Falha na conexão com a API de câmbio. Tente novamente.'));
      })
    );
  }

  getHistory(): HistoryItem[] {
    const localData = localStorage.getItem('angularcoin_history');
    return localData ? JSON.parse(localData) : [];
  }

  addHistoryItem(fromAmount: string, toAmount: string, rate: string): void {
    const history = this.getHistory();
    const newItem: HistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      fromAmount,
      toAmount,
      rate
    };
    
    const updatedHistory = [newItem, ...history];
    localStorage.setItem('angularcoin_history', JSON.stringify(updatedHistory));
  }

  clearHistory(): void {
    localStorage.removeItem('angularcoin_history');
  }

  // Gera dados históricos dos últimos 7 dias com base na taxa atual para alimentar o gráfico
  getHistoricalData(base: string, target: string, currentRate: number): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();

    // Gera pontos para os últimos 7 dias com pequenas flutuações simuladas de mercado
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }));

      // No dia de hoje, usa a taxa exata atual obtida da API
      if (i === 0) {
        data.push(currentRate);
      } else {
        const randomVariation = (Math.random() - 0.5) * 0.02; 
        data.push(Number((currentRate * (1 + randomVariation)).toFixed(4)));
      }
    }

    return { labels, data };
  }
}