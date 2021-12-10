import 'normalize.css';
import 'regenerator-runtime/runtime';

import './style.css';

import { render } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';

import { Prompt } from './Prompt';
import { Pupil } from './Pupil';
import { State } from './enum';
import { detectQuestion } from './detect';
import { exitFullscreen, requestFullscreen } from './fullscreen';
import { recognition, voice } from './speech';

const socket = new WebSocket('ws://192.168.50.93:21489/ws');

socket.onopen = () => {
  console.log('[open] Connection established');
  console.log('Sending to server');
};

socket.onclose = (e) => {
  if (e.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`
    );
  } else {
    console.log('[close] Connection died');
  }
};

socket.addEventListener('message', (e) => {
  console.log('e.data: ' + e.data);
  if (e.data === 'INTRO') {
    // @ts-ignore
    setState(() => State.INTRO);
  } else if (e.data === 'QL') {
    // @ts-ignore
    setState(() => State.PROMPT_FOR_QUESTION_LEFT);
  } else if (e.data === 'QR') {
    // @ts-ignore
    setState(() => State.PROMPT_FOR_QUESTION_RIGHT);
  } else if (e.data.startsWith('A')) {
    // @ts-ignore
    setQuestion(() => parseInt(e.data.substring(1, 2)));
    // @ts-ignore
    setState(() => State.PROMPT_FOR_ANSWER_LEFT);
  } else if (e.data.startsWith('B')) {
    // @ts-ignore
    setQuestion(() => parseInt(e.data.substring(1, 2)));
    // @ts-ignore
    setState(() => State.PROMPT_FOR_ANSWER_RIGHT);
  } else if (e.data === 'D') {
    // @ts-ignore
    setState(() => State.DISPENSE);
  }
});

socket.onerror = (e) => console.dir(e);

recognition.onresult = (e) => {
  console.log(e.results[e.resultIndex]);
  // @ts-ignore
  switch (state) {
    case State.PROMPT_FOR_QUESTION_LEFT: {
      const question = detectQuestion(e);
      console.log(question);
      if (question) {
        socket.send(`A${question}`);
        console.log(`queastion`);
      }
      break;
    }
    case State.PROMPT_FOR_QUESTION_RIGHT: {
      const question = detectQuestion(e);
      console.log(question);
      if (question) {
        socket.send(`B${question}`);
        console.log(`queastion`);
      }
      break;
    }
  }
};

const root = document.getElementById('root');
const prev = document.getElementById('prev');
const fullscreen = document.getElementById('fullscreen');
const next = document.getElementById('next');

const QUESTION_TEXT = [
  'What would you do if you could time-travel?',
  'How do you make your favorite dish?',
  "What's your craziest dream?",
  'Prove that you are not a robot',
];

prev.addEventListener('click', () => {
  // @ts-ignore
  setState((state) => (state === 0 ? 0 : state - 1));
});

fullscreen.addEventListener('click', () => {
  requestFullscreen(document.body, { navigationUI: 'hide' });
});

next.addEventListener('click', () => {
  // @ts-ignore
  setState((state) => (state + 1 === size ? 1 : (state + 1) % size));
});

// @ts-ignore
const size = Object.keys(State).length;

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  addEventListener('load', () =>
    navigator.serviceWorker.register('/service-worker.js')
  );
}

const App = () => {
  const [state, setState] = useState(State.WAITING_FOR_FULLSCREEN);
  const [question, setQuestion] = useState(null);
  const request = useCallback(async () => {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.voice = voice;
    speechSynthesis.speak(utterance);
    recognition.start();
    await new Promise<void>(
      (resolve) => (recognition.onstart = () => resolve())
    );
    root.removeEventListener('click', request);
    setState(() => State.INTRO);
  }, []);
  useEffect(() => {
    // @ts-ignore
    window.state = state;
  }, [state]);
  useEffect(() => {
    // @ts-ignore
    window.setState = setState;
    // @ts-ignore
    window.setQuestion = setQuestion;
    if (state === State.WAITING_FOR_FULLSCREEN && !document.fullscreenElement) {
      root.addEventListener('click', request);
      return exitFullscreen;
    }
  }, []);
  switch (state) {
    case State.INTRO:
      return (
        <Pupil
          verbalInstructions={[
            'Want a free snack?',
            'It just takes two people and a little game to get it.',
            'When you are ready, please touch the screen.',
          ]}
          onClick={() => socket.send('QL')}
        />
      );
    case State.PROMPT_FOR_QUESTION_LEFT:
      return (
        <Prompt
          paragraphs={[
            'Now one of you can pick a snack by reading the corresponding text out loud.',
          ]}
        />
      );
    case State.PROMPT_FOR_ANSWER_LEFT:
      return (
        <Prompt
          paragraphs={[
            'Please take turn to share your answers for this questions.',
            'Touch the screen whenever you feel "finished".',
          ]}
          textOnly={QUESTION_TEXT[question]}
          onClick={() => socket.send('QR')}
        />
      );
    case State.PROMPT_FOR_QUESTION_RIGHT:
      return (
        <Prompt
          paragraphs={[
            'Now the other person can pick another snack by reading the corresponding text out loud.',
          ]}
        />
      );
    case State.PROMPT_FOR_ANSWER_RIGHT:
      return (
        <Prompt
          paragraphs={[
            'Now take turn again to share your answers for this questions.',
            'Touch the screen whenever you feel "finished".',
          ]}
          textOnly={QUESTION_TEXT[question]}
          onClick={() => socket.send('D')}
        />
      );
    case State.DISPENSE:
      return (
        <Prompt
          paragraphs={[
            'Great conversation! Your snacks are being dispensed. Have a nice day!',
          ]}
          onClick={() => socket.send('INTRO')}
        />
      );
  }
  return null;
};

render(<App />, document.getElementById('root'));
