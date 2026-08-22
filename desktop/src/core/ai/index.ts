/**
 * Модуль AI: типы, клиент, провайдеры, промпты.
 */
export * from './types';
export { chatCompletion, ChatApiError } from './client';
export type { ChatClientOptions } from './client';
export { normalizeChatCompletionsUrl } from './chat-url';
export { resolveProvider, pingProvider, OLLAMA_DEFAULT } from './providers';
export type { ResolvedProvider } from './providers';
export { buildSystemPrompt, buildDesktopChatSystemPrompt, loadDesktopChatSystemPrompt } from './prompts';
export { API_PRESETS, apiPresetById } from './api-presets';
export type { ApiPreset } from './api-presets';
export { parseApiSnippet, isEmptySnippetResult } from './snippet-parse';
export type { ParsedApiSnippet } from './snippet-parse';
