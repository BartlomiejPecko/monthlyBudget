import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false, 
})
export class TranslatePipe implements PipeTransform {
  constructor(private ts: TranslationService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.ts.t(key, params);
  }
}