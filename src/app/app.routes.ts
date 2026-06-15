import { Routes } from '@angular/router';
import { Converter } from './components/converter/converter';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  // Rota inicial redireciona para o conversor
  { path: '', redirectTo: 'converter', pathMatch: 'full' },
  
  // Rotas das telas principais
  { path: 'converter', component: Converter },
  { path: 'history', component: HistoryComponent },
  
  // Rota de fallback
  { path: '**', redirectTo: 'converter' }
];