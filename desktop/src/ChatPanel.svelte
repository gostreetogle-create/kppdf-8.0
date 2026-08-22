<script lang="ts">
  /**
   * Чат вкладки AI (TZD-62): история + textarea + отправка через уже
   * готовый endpoint — встроенный раннер (`aiEndpoint(port)`, локальный
   * `.gguf`) **или** внешний OpenAI-совместимый API (TZD-65, `apiKey`
   * заполнен). Обе ветки — один и тот же `chatCompletion`, endpoint
   * резолвит родитель (`App.svelte`), панель ничего не знает про режим.
   * Персона — `buildDesktopChatSystemPrompt()` (LIMITED_HELPER, TZD-64 расширил глоссарием).
   */
  import { chatCompletion, type ChatMessage } from './core/ai';

  let {
    baseUrl,
    apiKey,
    modelName,
    systemPrompt,
    ready,
    disabledReason,
  }: {
    /** Готовый endpoint чат-API: `aiEndpoint(port)` (локально) или API `baseUrl` (TZD-65). */
    baseUrl: string | undefined;
    /** Ключ внешнего API-провайдера; `undefined` для локального раннера. */
    apiKey: string | undefined;
    modelName: string | undefined;
    systemPrompt: string;
    ready: boolean;
    disabledReason: string;
  } = $props();

  let history = $state<ChatMessage[]>([]);
  let draft = $state('');
  let sending = $state(false);
  let error = $state('');

  async function send() {
    const text = draft.trim();
    if (!text || sending || !ready || !baseUrl) return;
    error = '';
    const nextHistory = [...history, { role: 'user', content: text } satisfies ChatMessage];
    history = nextHistory;
    draft = '';
    sending = true;
    try {
      const res = await chatCompletion(
        { baseUrl, apiKey, timeoutMs: 120_000 },
        {
          model: modelName ?? 'local',
          messages: [{ role: 'system', content: systemPrompt }, ...nextHistory],
          temperature: 0.4,
        },
      );
      const reply = res.choices?.[0]?.message?.content?.trim() || '(пустой ответ модели)';
      history = [...nextHistory, { role: 'assistant', content: reply }];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Не удалось получить ответ от модели.';
    } finally {
      sending = false;
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }
</script>

<div class="card" data-test="ai-chat-panel">
  <h3>Чат</h3>
  {#if !ready}
    <p class="hint" data-test="ai-chat-disabled-reason">{disabledReason}</p>
  {/if}

  {#if history.length > 0}
    <div class="ai-chat-history" role="log" aria-live="polite" data-test="ai-chat-history">
      {#each history as msg, i (i)}
        <p class="ai-chat-msg ai-chat-msg--{msg.role}">
          <strong>{msg.role === 'user' ? 'Вы' : 'Модель'}:</strong>
          {msg.content}
        </p>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="errors" role="alert">{error}</p>
  {/if}

  <div class="ai-chat-input-row">
    <textarea
      class="input"
      data-test="ai-chat-input"
      bind:value={draft}
      onkeydown={onKeydown}
      disabled={!ready || sending}
      placeholder="Спросите про термины kppdf, порядок работы на этом ПК…"
      rows="2"
    ></textarea>
    <button
      class="btn btn--primary"
      type="button"
      data-test="ai-chat-send"
      onclick={send}
      disabled={!ready || sending || !draft.trim()}
    >
      {sending ? 'Отправка…' : 'Отправить'}
    </button>
  </div>
</div>

<style>
  /* Локальные стили: Svelte scoping не делится между компонентами, поэтому
     карточка/кнопки/поле повторяют вид App.svelte (.card/.btn/.input/.hint/.errors). */
  .card {
    background: #ffffff;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 0.9rem 1rem;
    box-shadow: 0 1px 2px rgb(16 24 40 / 0.04);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .card h3 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
  }

  .hint {
    color: #7a8794;
    font-size: 0.8rem;
    line-height: 1.5;
    margin: 0 0 0.5rem;
  }

  .errors {
    margin: 0 0 0.65rem;
    padding: 0.5rem 0.7rem;
    border-radius: 8px;
    background: #fdf0ef;
    border: 1px solid #f2c8c4;
    color: #a12b23;
    font-size: 0.78rem;
  }

  .btn {
    font: inherit;
    padding: 0.5rem 1rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
    background: #eef1f4;
    color: #44535f;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  .btn:hover:not(:disabled) {
    background: #e2e7ec;
    border-color: #9aa6b1;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn--primary {
    background: #1c2733;
    color: #f4f5f7;
    border-color: #1c2733;
  }

  .btn--primary:hover:not(:disabled) {
    background: #2c3a49;
  }

  .input {
    font: inherit;
    padding: 0.4rem 0.6rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
  }

  .ai-chat-history {
    max-height: 16rem;
    overflow-y: auto;
    border: 1px solid #d9dee3;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
  }
  .ai-chat-msg {
    margin: 0.25rem 0;
    white-space: pre-wrap;
    font-size: 0.85rem;
  }
  .ai-chat-msg--assistant {
    color: #1c2733;
  }
  .ai-chat-input-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }
  .ai-chat-input-row textarea {
    flex: 1;
    resize: vertical;
  }
</style>
