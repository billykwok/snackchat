import 'normalize.css';
import 'regenerator-runtime/runtime';

import './style.css';

import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { render } from 'react-dom';
import { useEffect, useState } from 'react';

import { Prompt } from './Prompt';

const enum State {
  INTRO,
  ASK_FOR_NAME,
}

type UseSpeechRecognitionResult = {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  listening: boolean;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  browserSupportsContinuousListening: boolean;
  isMicrophoneAvailable: boolean;
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

document.body.addEventListener('click', () => {
  console.log('clicked');
  const voices = speechSynthesis
    .getVoices()
    .filter((v) => v.name.includes('Samantha'));
  console.dir(speechSynthesis.getVoices());
  if (voices.length < 1) {
    console.error('No English voices available');
  }
  const utterance = new SpeechSynthesisUtterance(
    'Hello! Want some free snacks? It just takes two people and a little game to get it. Just let me know when you are ready.'
  );
  utterance.voice = voices[0];
  speechSynthesis.speak(utterance);
});

const App = () => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition({}) as UseSpeechRecognitionResult;
  const listenContinuously = () =>
    SpeechRecognition.startListening({ continuous: true });
  if (!browserSupportsSpeechRecognition) {
    return <span>No browser support</span>;
  }
  if (!browserSupportsContinuousListening) {
    return <span>No browser support</span>;
  }
  if (!isMicrophoneAvailable) {
    return <span>Please allow access to the microphone</span>;
  }
  const [state, setState] = useState(() => State.INTRO);
  switch (state) {
    case State.INTRO:
      return (
        <Prompt
          paragraphs={[
            'It takes two people and a little game to get free food.',
            'Invite someone to join?',
          ]}
        />
      );
    case State.ASK_FOR_NAME:
      return <Prompt paragraphs={['What is your name?']} />;
  }
  return null;
};

render(<App />, document.getElementById('root'));
