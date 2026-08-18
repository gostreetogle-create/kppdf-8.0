import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * TZ-COMP-401 — Политика обработки персональных данных.
 * Публичная страница, без authGuard.
 */
@Component({
  selector: 'app-privacy-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-paper text-ink font-body px-page-x py-12">
      <main class="w-full max-w-3xl mx-auto">
        <div class="flex items-center gap-2 mb-10">
          <span class="block w-[10px] h-[10px] bg-ink shrink-0" aria-hidden="true"></span>
          <span class="font-display font-bold tracking-tight"> KPPDF </span>
        </div>

        <h1 class="font-display text-3xl font-semibold mb-8">
          Политика обработки персональных данных
        </h1>

        <div class="prose prose-sm prose-ink max-w-none space-y-6">
          <section>
            <h2 class="text-xl font-medium mb-3">1. Оператор</h2>
            <p><strong>[Наименование организации / ИП]</strong></p>
            <p>ИНН: <strong>[ ]</strong></p>
            <p>Адрес: <strong>[ ]</strong></p>
            <p>E-mail для обращений по ПДn: <strong>[ ]</strong></p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">2. О системе</h2>
            <p>
              <strong
                >Внутренняя информационная система. Доступ только уполномоченным лицам по
                приглашению администратора. Не публичный сервис и не рекламная площадка.</strong
              >
            </p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">3. Цели обработки</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                Предоставление доступа к информационной системе kppdf (учётные записи,
                device-grant).
              </li>
              <li>
                Ведение CRM: контрагенты, контактные лица, сотрудники, производственные данные.
              </li>
              <li>Обеспечение безопасности (audit log, rate limit, резервное копирование).</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">4. Категории субъектов и данных</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b hairline border-sunrise-warm">
                    <th class="py-2 pr-4 font-medium">Субъекты</th>
                    <th class="py-2 font-medium">Данные</th>
                  </tr>
                </thead>
                <tbody class="divide-y hairline divide-sunrise-warm">
                  <tr>
                    <td class="py-2 pr-4">Пользователи ИС</td>
                    <td class="py-2">логин, e-mail, телефон (если указан), роль, cookie сессии</td>
                  </tr>
                  <tr>
                    <td class="py-2 pr-4">Сотрудники (Worker)</td>
                    <td class="py-2">ФИО, контакты, должность</td>
                  </tr>
                  <tr>
                    <td class="py-2 pr-4">Контактные лица (Person)</td>
                    <td class="py-2">ФИО, e-mail, телефон</td>
                  </tr>
                  <tr>
                    <td class="py-2 pr-4">Контрагенты</td>
                    <td class="py-2">наименование, ИНН, адрес, контакты</td>
                  </tr>
                  <tr>
                    <td class="py-2 pr-4">При подключении устройства</td>
                    <td class="py-2">имя компьютера (deviceName), технические cookie</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">5. Правовые основания</h2>
            <p>
              ст. 6 152-ФЗ: исполнение договора; согласие субъекта; законные интересы оператора
              (безопасность) — <strong>уточнить юристом по каждой категории</strong>.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">6. Cookies</h2>
            <p>
              Используется cookie <code>__Host-kppdf-device</code> для запоминания авторизованного
              браузера после одноразовой ссылки-приглашения. Срок — до отзыва или истечения grant.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">7. Передача третьим лицам</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                Primary хранение: серверы на территории <strong>Российской Федерации</strong>.
              </li>
              <li>
                Иностранные сервисы мониторинга <strong>не используются</strong> (Sentry отключён),
                если иное не указано в обновлении политики.
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">8. Трансграничная передача</h2>
            <p><strong>[Заполнить юристом]</strong> — по умолчанию: не осуществляется.</p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">9. Срок хранения</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>Данные учётных записей — пока активны + <strong>[ ]</strong> после удаления.</li>
              <li>Audit log — <strong>[ ]</strong>.</li>
              <li>Бэкапы — <strong>[ ]</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">10. Права субъекта</h2>
            <p>
              Запрос доступа, уточнения, блокирования, уничтожения ПДn — на e-mail оператора. Срок
              ответа — 30 дней (ст. 20 152-ФЗ).
            </p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">11. Меры защиты</h2>
            <p>
              Разграничение доступа по ролям, HTTPS, device-invite, audit, резервное копирование.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-medium mb-3">12. Изменения политики</h2>
            <p>
              Актуальная версия: <code>/legal/privacy</code>. Дата редакции: <strong>[ ]</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  `,
})
export class PrivacyPage {}
