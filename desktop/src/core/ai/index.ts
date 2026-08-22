/**
 * Модуль AI: типы, клиент, провайдеры, промпты.
 */
export * from './types';
export { chatCompletion } from './client';
export type { ChatClientOptions } from './client';
export { resolveProvider, pingProvider, OLLAMA_DEFAULT } from './providers';
export type { ResolvedProvider } from './providers';
export { buildSystemPrompt, buildDesktopChatSystemPrompt, loadDesktopChatSystemPrompt } from './prompts';
