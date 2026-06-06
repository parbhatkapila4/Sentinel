export interface SentinelSpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

export interface SentinelSpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SentinelSpeechRecognitionAlternative;
}

export interface SentinelSpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SentinelSpeechRecognitionResult;
}

export interface SentinelSpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SentinelSpeechRecognitionResultList;
}

export interface SentinelSpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

export interface SentinelSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop?: () => void;
  abort?: () => void;
  onresult: ((e: SentinelSpeechRecognitionEvent) => void) | null;
  onerror: ((e: SentinelSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export type SentinelSpeechRecognitionCtor = new () => SentinelSpeechRecognition;

export interface SentinelWindowWithSpeech {
  SpeechRecognition?: SentinelSpeechRecognitionCtor;
  webkitSpeechRecognition?: SentinelSpeechRecognitionCtor;
}
