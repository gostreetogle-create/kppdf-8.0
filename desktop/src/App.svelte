<script lang="ts">
  // Фундамент KPPDF Desktop. Все кнопки — стабы, фичи придут будущими TZ
  // (паринг, AI-импорт, файловые парсеры).
  const todo = 'TODO: реализация — будущая TZ';
</script>

<svelte:head>
  <title>KPPDF Desktop</title>
</svelte:head>

<main class="shell">
  <header class="shell__header">
    <h1>KPPDF Desktop</h1>
    <p class="shell__subtitle">Десктоп-компаньон kppdf-8.0 — массовый ввод данных через AI</p>
  </header>

  <section class="cards">
    <article class="card">
      <h2>Подключение</h2>
      <p>Паринг с сервером kppdf: веб-клиент генерирует JSON, десктоп сохраняет и проверяет через /auth/me.</p>
      <button disabled title={todo}>Подключить сервер</button>
    </article>

    <article class="card">
      <h2>AI-импорт</h2>
      <p>Массовый ввод данных: файл → парсинг → AI-нормализация → подтверждение → батч-отправка.</p>
      <button disabled title={todo}>Импортировать данные</button>
    </article>
  </section>

  <footer class="shell__footer">
    <p>Скелет v0.1 — фичи помечены TODO (см. README.md → Roadmap).</p>
  </footer>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      sans-serif;
    background: #f4f5f7;
    color: #1c2733;
  }

  .shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 2rem 2.5rem;
  }

  .shell__header {
    border-bottom: 1px solid #d9dee3;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    letter-spacing: -0.01em;
  }

  .shell__subtitle {
    margin: 0.35rem 0 0;
    color: #5a6a78;
    font-size: 0.95rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .card {
    background: #ffffff;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 2px rgb(16 24 40 / 0.04);
  }

  .card h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  .card p {
    margin: 0 0 1rem;
    color: #44535f;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  button {
    font: inherit;
    padding: 0.5rem 1rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
    background: #eef1f4;
    color: #44535f;
    cursor: not-allowed;
  }

  .shell__footer {
    margin-top: auto;
    padding-top: 1.5rem;
    color: #7a8794;
    font-size: 0.8rem;
  }
</style>
