import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaperAndInk } from './paper-and-ink';

describe('PaperAndInk', () => {
  let component: PaperAndInk;
  let fixture: ComponentFixture<PaperAndInk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaperAndInk],
    }).compileComponents();

    fixture = TestBed.createComponent(PaperAndInk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
