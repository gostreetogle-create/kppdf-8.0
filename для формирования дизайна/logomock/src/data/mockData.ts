import { ProposalDocument, Product, Material, WorkType, Organization, Contract, StockMovement, AuditIssue } from '../types';

export const INITIAL_PROPOSAL: ProposalDocument = {
  id: 'prop-801',
  number: 'КП-2026/084-E',
  date: '2026-07-24',
  validUntil: '2026-08-15',
  organizationName: 'ООО "ПРОМПРОЕКТ-АЛЬФА"',
  clientName: 'АО "ТЕХНОКОМПЛЕКС ГРУПП"',
  clientInn: '7704819203',
  contractorName: 'ООО "КП ДИЗАЙН И ИНЖИНИРИНГ"',
  currency: 'RUB',
  status: 'approved',
  totalAmount: 1845000,
  vatAmount: 307500,
  discountAmount: 95000,
  notes: 'В стоимость входит шеф-монтаж и пусконаладочные работы на объекте Заказчика.',
  blocks: [
    {
      id: 'blk-1',
      type: 'header',
      title: 'Шапка и реквизиты сторон',
      isLocked: true,
      variables: {
        company: 'ООО "КП ДИЗАЙН И ИНЖИНИРИНГ"',
        client: 'АО "ТЕХНОКОМПЛЕКС ГРУПП"',
        documentNo: 'КП-2026/084-E',
        date: '24.07.2026'
      }
    },
    {
      id: 'blk-2',
      type: 'text',
      title: 'Вводная часть и цель предложения',
      content: 'Благодарим Вас за интерес к продукции нашей компании. Настоящим направляем коммерческое предложение на поставку и сборку специализированных технологических модулей серии "Спектр-800" с автоматизированной системой управления.'
    },
    {
      id: 'blk-3',
      type: 'table',
      title: 'Спецификация оборудования и материалов',
      tableData: [
        {
          id: 'item-1',
          code: 'MOD-801',
          name: 'Модуль распределения энергии МР-800 Executive',
          unit: 'компл.',
          quantity: 2,
          price: 520000,
          discount: 5,
          total: 988000
        },
        {
          id: 'item-2',
          code: 'MAT-402',
          name: 'Шина медная изолированная ШМИ-100 (10м)',
          unit: 'шт.',
          quantity: 8,
          price: 34000,
          discount: 0,
          total: 272000
        },
        {
          id: 'item-3',
          code: 'WRK-105',
          name: 'Монтаж, калибровка и первичные пусконаладочные испытания',
          unit: 'услуга',
          quantity: 1,
          price: 280000,
          discount: 10,
          total: 252000
        },
        {
          id: 'item-4',
          code: 'SRV-003',
          name: 'Расширенная гарантия (24 месяца) и техподдержка 24/7',
          unit: 'услуга',
          quantity: 1,
          price: 125000,
          discount: 0,
          total: 125000
        }
      ]
    },
    {
      id: 'blk-4',
      type: 'terms',
      title: 'Условия оплаты и поставки',
      content: '• Предоплата 50% в течение 5 банковских дней с момента подписания Договора.\n• Окончательный расчет 50% по факту уведомления о готовности к отгрузке.\n• Срок изготовления и отгрузки: 18 рабочих дней с момента получения аванса.\n• Доставка транспортом Поставщика до склада Заказчика в г. Москва.'
    },
    {
      id: 'blk-5',
      type: 'signatures',
      title: 'Подписи и печати сторон',
      isLocked: true,
      variables: {
        director: 'Иванов С.В. / Генеральный директор',
        clientRep: 'Петров А.Н. / Директор по закупкам'
      }
    }
  ]
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-801',
    name: 'Шкаф автоматики ША-800 Executive',
    category: 'Электрощитовое оборудование',
    modulesCount: 4,
    costPrice: 380000,
    sellingPrice: 580000,
    marginPercent: 52.6,
    unit: 'шт.',
    status: 'active',
    description: 'Силовой шкаф управления с сенсорной панелью HMI и встроенным ИБП.'
  },
  {
    id: 'prod-2',
    code: 'PRD-802',
    name: 'Модуль вентиляции и фильтрации ВФM-200',
    category: 'Климатические модули',
    modulesCount: 2,
    costPrice: 145000,
    sellingPrice: 220000,
    marginPercent: 51.7,
    unit: 'шт.',
    status: 'active',
    description: 'Вентиляционный блок повышенной очистки с HEPA-фильтрами.'
  },
  {
    id: 'prod-3',
    code: 'PRD-803',
    name: 'Кабельный трасс-конструктор КТ-100',
    category: 'Металлоконструкции',
    modulesCount: 1,
    costPrice: 62000,
    sellingPrice: 98000,
    marginPercent: 58.0,
    unit: 'секц.',
    status: 'active',
    description: 'Оцинкованный лоток перфорированный с быстросъемными крышками.'
  }
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    code: 'MAT-101',
    name: 'Лист стальной оцинкованный 2.0мм (2000х1000)',
    type: 'metal',
    stockQuantity: 420,
    reservedQuantity: 85,
    unit: 'лист',
    purchasePrice: 4200,
    supplier: 'Северсталь ПАО'
  },
  {
    id: 'mat-2',
    code: 'MAT-102',
    name: 'Автоматический выключатель 3P 63A Schneider',
    type: 'electrical',
    stockQuantity: 64,
    reservedQuantity: 18,
    unit: 'шт.',
    purchasePrice: 8500,
    supplier: 'ЭлектроКомплект ООО'
  },
  {
    id: 'mat-3',
    code: 'MAT-103',
    name: 'Провод термостойкий ПуГВ 1х6.0 мм2',
    type: 'electrical',
    stockQuantity: 1500,
    reservedQuantity: 300,
    unit: 'м',
    purchasePrice: 110,
    supplier: 'КабельПоставка Групп'
  },
  {
    id: 'mat-4',
    code: 'MAT-104',
    name: 'Краска порошковая эпоксидно-полиэфирная RAL 7035',
    type: 'coating',
    stockQuantity: 180,
    reservedQuantity: 40,
    unit: 'кг',
    purchasePrice: 650,
    supplier: 'ПрофиПокрытие ООО'
  }
];

export const MOCK_WORK_TYPES: WorkType[] = [
  {
    id: 'wrk-1',
    code: 'WRK-01',
    name: 'Лазерная резка и раскрой листового металла',
    hourlyRate: 3500,
    standardHours: 1.5,
    workCenter: 'Цех раскроя (ЧПУ)'
  },
  {
    id: 'wrk-2',
    code: 'WRK-02',
    name: 'Порошковая окраска и полимеризация',
    hourlyRate: 2800,
    standardHours: 2.0,
    workCenter: 'Малярный цех №2'
  },
  {
    id: 'wrk-3',
    code: 'WRK-03',
    name: 'Сборка силовых цепей и монтаж автоматики',
    hourlyRate: 4200,
    standardHours: 4.5,
    workCenter: 'Сборочный участок №1'
  }
];

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'АО "ТЕХНОКОМПЛЕКС ГРУПП"',
    inn: '7704819203',
    kpp: '770401001',
    city: 'Москва',
    contactPerson: 'Петров Алексей Николаевич',
    email: 'a.petrov@technocomplex.ru',
    phone: '+7 (495) 820-11-22',
    role: 'client',
    status: 'active'
  },
  {
    id: 'org-2',
    name: 'ООО "СТРОЙТЕХ-ИНВЕСТ"',
    inn: '7810928374',
    kpp: '781001001',
    city: 'Санкт-Петербург',
    contactPerson: 'Смирнова Елена Сергеевна',
    email: 'info@stroytech.spb.ru',
    phone: '+7 (812) 490-33-44',
    role: 'client',
    status: 'lead'
  },
  {
    id: 'org-3',
    name: 'ПАО "СЕВЕРСТАЛЬ"',
    inn: '3528000597',
    kpp: '352801001',
    city: 'Череповец',
    contactPerson: 'Волков Михаил Дмитриевич',
    email: 'sales@severstal.com',
    phone: '+7 (800) 200-33-66',
    role: 'supplier',
    status: 'active'
  }
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'cnt-1',
    number: 'ДОГ-2026/112',
    date: '2026-07-20',
    clientName: 'АО "ТЕХНОКОМПЛЕКС ГРУПП"',
    proposalRef: 'КП-2026/084-E',
    amount: 1845000,
    status: 'signed'
  },
  {
    id: 'cnt-2',
    number: 'ДОГ-2026/098',
    date: '2026-07-05',
    clientName: 'ООО "СТРОЙТЕХ-ИНВЕСТ"',
    proposalRef: 'КП-2026/062',
    amount: 940000,
    status: 'active'
  }
];

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    date: '2026-07-24 14:30',
    materialName: 'Лист стальной оцинкованный 2.0мм',
    quantity: 85,
    type: 'reserve',
    documentRef: 'КП-2026/084-E',
    operator: 'Марков И.А.'
  },
  {
    id: 'mov-2',
    date: '2026-07-24 11:15',
    materialName: 'Автоматический выключатель 3P 63A',
    quantity: 100,
    type: 'in',
    documentRef: 'ПН-2026/044',
    operator: 'Сидоров К.В.'
  },
  {
    id: 'mov-3',
    date: '2026-07-23 16:45',
    materialName: 'Провод термостойкий ПуГВ 1х6.0 мм2',
    quantity: 250,
    type: 'out',
    documentRef: 'ЗП-2026/019',
    operator: 'Марков И.А.'
  }
];

export const AUDIT_ISSUES: AuditIssue[] = [
  {
    id: 'aud-1',
    category: 'dark_mode',
    severity: 'high',
    title: 'Тёмная тема (Dark Mode) — Плохая контрастность и плоский фон',
    problem: 'В исходном репозитории тёмная тема задана через единый плоский цвет #1A1A1A без слоев высоты (elevation levels), с тусклыми линиями #333333 и серым текстом #888888, который падает ниже стандарта WCAG AA 4.5:1.',
    solution: 'Разработана 5-уровневая система высот Obsidian Slate (#0B0E11 → #12161A → #181D23 → #20262E) с контрастными волосяными границами (#262E38) и тёплым светящимся золотым акцентом (#E2B842).',
    status: 'fixed'
  },
  {
    id: 'aud-2',
    category: 'ui',
    severity: 'high',
    title: 'Перегруженность навигации и отсутствие структурированного конструктора',
    problem: '89 сущностей были фрагментированы по разным мелким вкладкам без единого visual builder для коммерческих предложений. Отсутствовал режим быстрого предпросмотра PDF.',
    solution: 'Внедрен 3-панельный конструктор (Библиотека блоков → Живой холст PDF → Инспектор свойств) с мгновенным переключением режимов Редактирование / Печать PDF.',
    status: 'fixed'
  },
  {
    id: 'aud-3',
    category: 'architecture',
    severity: 'medium',
    title: 'Типографика и микро-заголовки (Eyebrows)',
    problem: 'Шрифт Hanken Grotesk и Inter использовались со случайными межбуквенными интервалами (letter-spacing), создавать перекосы на кнопках и бейджах.',
    solution: 'Стандартизированы моноширинные микро-заголовки .eyebrow (JetBrains Mono, 11px, uppercase, tracking-wider) и строго рассчитанные отступы по сетке 4px/8px.',
    status: 'fixed'
  },
  {
    id: 'aud-4',
    category: 'ux',
    severity: 'medium',
    title: 'Расчет маржинальности и спецификации в реальном времени',
    problem: 'Таблицы КП и продуктов содержали жестко прописанные итоговые суммы без автоматического перерасчета скидок, НДС и себестоимости материалов (BOM).',
    solution: 'Добавлен интерактивный калькулятор с автоматической калькуляцией скидки, НДС (20%), себестоимости и маржи с цветной индикацией рентабельности.',
    status: 'fixed'
  }
];
