import 'normalize.css';
import 'regenerator-runtime/runtime';

import './style.css';

import { render } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';

import { Prompt } from './Prompt';
import { Pupil } from './Pupil';
import { exitFullscreen, requestFullscreen } from './fullscreen';
import { recognition, voice } from './speech';

const root = document.getElementById('root');
const fullscreen = document.getElementById('fullscreen');

const socket = new WebSocket('ws://localhost:21489/ws');

socket.onopen = () => {
  console.log('[open] Connection established');
  console.log('Sending to server');
};

socket.onmessage = (event) => {
  const json = JSON.parse(event.data as string) as Data;
  if (
    json.emotion &&
    Object.keys(COLOR_MAP).includes(json.emotion) &&
    COLOR_MAP[json.emotion] &&
    COLOR_MAP[json.emotion] !== params.color
  ) {
    params.color = COLOR_MAP[json.emotion];
  }
  if (json.handDistance && typeof json.handDistance === 'number') {
    params.area = json.handDistance * 10;
  }
  // if (json.bpm) {
  //   params.speed = map(json.bpm, 0, 200, 0.05, 1);
  // }
  if (json.gsr) {
    params.value = map(json.gsr, 100, 1000, 1, 250);
  }
  if (json.acceleration) {
    params.inc = Math.round(
      // map(dist(json.acceleration[0], json.acceleration[1], 0), 0, 3, 0, 10)
      map(Math.abs(json.acceleration[0]), 0, 10, 5, 0)
    );
  }
  if (json.bpm) {
    console.log(json.bpm);
    params.r = map(json.bpm, 50, 120, 4, 50);
    // params.r = map(json.gyro[2], -3, 3, 4, 50);
  }
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = function (event) {
  console.error(`[error] ${event.toString()}`);
};

fullscreen.addEventListener('click', () => {
  requestFullscreen(document.body, { navigationUI: 'hide' });
});

const enum State {
  WAITING_FOR_FULLSCREEN = 0,
  EYE = 1,
  INTRO = 2,
  PROMPT_FOR_QUESTION_LEFT = 3,
  PROMPT_FOR_ANSWER_LEFT = 4,
  PROMPT_FOR_QUESTION_RIGHT = 5,
  PROMPT_FOR_ANSWER_RIGHT = 6,
  DISPENSE = 7,
}

// @ts-ignore
const size = Object.keys(State).length;

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  addEventListener('load', () =>
    navigator.serviceWorker.register('/service-worker.js')
  );
}

const App = () => {
  const [state, setState] = useState(State.WAITING_FOR_FULLSCREEN);
  const request = useCallback(async () => {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.voice = voice;
    speechSynthesis.speak(utterance);
    recognition.onresult = (e) => {
      const result = e.results[e.resultIndex];
      for (const it of Array.from(result)) {
        if (
          ['craziest', 'dream'].every((tk) =>
            it.transcript.toLowerCase().includes(tk)
          )
        ) {
          console.log("What's your craziest dream?");
        }
      }
    };
    recognition.start();
    await new Promise<void>(
      (resolve) => (recognition.onstart = () => resolve())
    );
    root.removeEventListener('click', request);
    setState(() => State.EYE);
  }, []);
  useEffect(() => {
    if (state === State.WAITING_FOR_FULLSCREEN && !document.fullscreenElement) {
      root.addEventListener('click', request);
      return exitFullscreen;
    }
  }, []);
  const next = useCallback(
    (e: Event) => {
      console.log(state);
      e.preventDefault();
      setState((state) => (state + 1 === size ? 1 : (state + 1) % size));
    },
    [state]
  );
  switch (state) {
    case State.INTRO:
      return (
        <Prompt
          title="Hello!"
          paragraphs={[
            'Want a free snack?',
            'It just takes two people and a little game to get it.',
            'When you are ready, please introduce yourself to each other.',
          ]}
          onClick={next}
        />
      );
    case State.PROMPT_FOR_QUESTION_LEFT:
      return (
        <Prompt
          paragraphs={[
            'Billy, please pick a snack by reading the corresponding text out loud.',
          ]}
          onClick={next}
        />
      );
    case State.PROMPT_FOR_ANSWER_LEFT:
      return (
        <Prompt
          paragraphs={[
            'Billy and Yilin, please take turn to share your answers for this questions.',
          ]}
          textOnly={'What would you do if you could time-travel?'}
          onClick={next}
        />
      );
    case State.PROMPT_FOR_QUESTION_RIGHT:
      return (
        <Prompt
          paragraphs={[
            'Yilin, please pick another snack by reading the corresponding text out loud.',
          ]}
          onClick={next}
        />
      );
    case State.PROMPT_FOR_ANSWER_RIGHT:
      return (
        <Prompt
          paragraphs={[
            'Now take turn to share your answers for this questions.',
          ]}
          textOnly={'How do you make your favorite dish?'}
          onClick={next}
        />
      );
    case State.DISPENSE:
      return (
        <Prompt
          paragraphs={[
            'Great conversation! Your snacks are being dispensed. Don’t forget to grab your receipts.',
          ]}
          onClick={next}
        />
      );
    case State.EYE:
      return <Pupil onClick={next} />;
  }
  return null;
};

render(<App />, document.getElementById('root'));
