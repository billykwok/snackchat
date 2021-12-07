const voices = speechSynthesis
  .getVoices()
  .filter((v) => v.name.includes('Samantha'));
if (voices.length < 1) {
  console.error('No English voices available');
}
export const voice = voices[0];

interface webkitSpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onaudioend: (event: Event) => void;
  onaudiostart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onnomatch: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onsoundend: (event: Event) => void;
  onsoundstart: (event: Event) => void;
  onspeechend: (event: Event) => void;
  onspeechstart: (event: Event) => void;
  onstart: (event: Event) => void;
  readonly confidence: number;
  readonly transcript: string;
  abort(): void;
  start(): void;
  stop(): void;
}

declare interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

declare const webkitSpeechRecognition: {
  prototype: webkitSpeechRecognition;
  new (): webkitSpeechRecognition;
};

export const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
