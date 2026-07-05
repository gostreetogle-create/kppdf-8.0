import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CurrencyService } from '../../modules/currency/currency.service';

interface SeedCurrency {
  code: string;
  label: string;
  symbol?: string;
  sortOrder: number;
}

const DEFAULT_CURRENCIES: readonly SeedCurrency[] = [
  { code: 'RUB', label: 'Российский рубль',     symbol: '₽', sortOrder: 10 },
  { code: 'USD', label: 'Доллар США',           symbol: '$', sortOrder: 20 },
  { code: 'EUR', label: 'Евро',                 symbol: '€', sortOrder: 30 },
  { code: 'CNY', label: 'Китайский юань',       symbol: '¥', sortOrder: 40 },
] as const;

@Injectable()
export class CurrenciesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrenciesSeed.name);

  constructor(private readonly currencies: CurrencyService) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const c of DEFAULT_CURRENCIES) {
      try {
        await this.currencies.findByCode(c.code);
      } catch {
        await this.currencies.create({
          code: c.code,
          label: c.label,
          symbol: c.symbol,
          sortOrder: c.sortOrder,
          isActive: true,
          isSystem: true,
        });
        this.logger.log(`Currency seeded: ${c.code}`);
      }
    }
  }
}
