import { TestBed } from '@angular/core/testing';
import { PiNotificationCenterService } from './pi-notification-center.service';
import { NOTIFICATION_RING_SIZE } from './pi-notification.types';

describe('PiNotificationCenterService', () => {
  let service: PiNotificationCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiNotificationCenterService);
  });

  it('starts empty', () => {
    expect(service.items()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('pushes newest at the end and counts unread', () => {
    service.push({ title: 'A' });
    service.push({ title: 'B', severity: 'error' });
    expect(service.items().map((n) => n.title)).toEqual(['A', 'B']);
    expect(service.unreadCount()).toBe(2);
  });

  it('drops oldest when ring exceeds max', () => {
    for (let i = 0; i < NOTIFICATION_RING_SIZE + 3; i++) {
      service.push({ title: `n-${i}` });
    }
    const titles = service.items().map((n) => n.title);
    expect(titles).toHaveLength(NOTIFICATION_RING_SIZE);
    expect(titles[0]).toBe('n-3');
    expect(titles[titles.length - 1]).toBe(`n-${NOTIFICATION_RING_SIZE + 2}`);
  });

  it('dismiss removes one; clear empties', () => {
    const id = service.push({ title: 'X' });
    service.push({ title: 'Y' });
    service.dismiss(id);
    expect(service.items().map((n) => n.title)).toEqual(['Y']);
    service.clear();
    expect(service.items()).toEqual([]);
  });

  it('opening panel marks all read', () => {
    service.push({ title: 'A' });
    expect(service.unreadCount()).toBe(1);
    service.togglePanel(true);
    expect(service.panelOpen()).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });
});
