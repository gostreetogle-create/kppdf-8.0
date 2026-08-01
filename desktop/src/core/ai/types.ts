/**
 * Типы OpenAI-совместимого чат-API (Ollama и удалённые провайдеры
 * используют один и тот же формат /v1/chat/completions).
 */

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  /** Попросить модель вернуть валидный JSON (поддерживают не все). */
  response_format?: { type: 'json_object' };
}

export interface ChatResponseChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatResponseUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatResponseChoice[];
  usage?: ChatResponseUsage;
}
