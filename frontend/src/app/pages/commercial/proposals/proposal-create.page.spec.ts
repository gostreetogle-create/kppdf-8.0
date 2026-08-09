import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';

import { ProposalCreatePage } from './proposal-create.page';
import { AuthService } from '../../../core/auth.service';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('ProposalCreatePage (TZ-SALES-312)', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalCreatePage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AuthService,
          useValue: {
            user: signal({ pages: ['proposals', 'contracts', 'orders'] }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalCreatePage);
    fixture.detectChanges();
  });

  it('renders three studio regions with data-test hooks', () => {
    const left = fixture.debugElement.query(By.css('[data-test="kp-create-left"]'));
    const center = fixture.debugElement.query(By.css('[data-test="kp-create-center"]'));
    const right = fixture.debugElement.query(By.css('[data-test="kp-create-right"]'));

    expect(left).toBeTruthy();
    expect(center).toBeTruthy();
    expect(right).toBeTruthy();

    expect(left.nativeElement.textContent).toContain('Выберите изделие — оно попадёт в КП');
    expect(center.nativeElement.textContent).toContain(
      'Выберите шаблон КП или добавьте позиции слева',
    );
    expect(right.nativeElement.textContent).toContain('Укажите нашу фирму (бланк) и наценку');
  });

  it('keeps Deals TOC + Создать КП chip active wiring in the shell', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      dealsToc: { id: string }[];
      kpSectionChips: { id: string }[];
    };
    expect(page.dealsToc.map((c) => c.id)).toEqual(['proposals', 'contracts', 'orders']);
    expect(page.kpSectionChips.map((c) => c.id)).toEqual(['create', 'all']);
  });

  it('opens at most one side panel on narrow viewport', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      isWide: { set: (v: boolean) => void };
      leftOpen: { (): boolean; set: (v: boolean) => void };
      rightOpen: { (): boolean; set: (v: boolean) => void };
      toggleLeft: () => void;
      toggleRight: () => void;
    };

    page.isWide.set(false);
    fixture.detectChanges();

    page.toggleLeft();
    expect(page.leftOpen()).toBe(true);
    expect(page.rightOpen()).toBe(false);

    page.toggleRight();
    expect(page.rightOpen()).toBe(true);
    expect(page.leftOpen()).toBe(false);
  });
});
