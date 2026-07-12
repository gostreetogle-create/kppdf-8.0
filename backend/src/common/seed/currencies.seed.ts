import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CurrencyService } from '../../modules/currency/currency.service';

interface SeedCurrency {
  key: string;
  label: string;
  code: string;
  symbol: string;
  rate: number;
  isBase: boolean;
  locale: string;
  precision: number;
  sortOrder: number;
}

const DEFAULT_CURRENCIES: readonly SeedCurrency[] = [
  { key: 'RUB', label: 'Российский рубль',  code: '643', symbol: '₽',  rate: 1.0,  isBase: true,  locale: 'ru-RU', precision: 2, sortOrder: 10 },
  { key: 'USD', label: 'Доллар США',         code: '840', symbol: '$',  rate: 90.50, isBase: false, locale: 'en-US', precision: 2, sortOrder: 20 },
  { key: 'EUR', label: 'Евро',               code: '978', symbol: '€',  rate: 98.30, isBase: false, locale: 'de-DE', precision: 2, sortOrder: 30 },
] as const;

@Injectable()
export class CurrenciesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrenciesSeed.name);

  constructor(private readonly currencies: CurrencyService) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const c of DEFAULT_CURRENCIES) {
      try {
        await this.currencies.findByKey(c.key);
      } catch {
        try {
          await this.currencies.create({
            key: c.key,
            label: c.label,
            code: c.code,
            symbol: c.symbol,
            rate: c.rate,
            isBase: c.isBase,
            locale: c.locale,
            precision: c.precision,
            sortOrder: c.sortOrder,
            isActive: true,
            isSystem: true,
          });
          this.logger.log(`Currency seeded: ${c.key}`);
        } catch (err) {
          this.logger.warn(`Could not seed currency ${c.key}: ${(err as Error).message}`);
        }
      }
    }
  }
}
