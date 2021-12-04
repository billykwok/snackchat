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

const enum State {
  WAITING_FOR_FULLSCREEN = 0,
  EYE = 1,
  INTRO = 2,
  ASK_FOR_NAME = 3,
}

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
    console.log(recognition.start());
    await new Promise<void>(
      (resolve) => (recognition.onstart = () => resolve())
    );
    requestFullscreen(root, { navigationUI: 'hide' });
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
      setState((state) => (state === 3 ? 1 : (state + 1) % 4));
    },
    [state]
  );
  switch (state) {
    case State.INTRO:
      return (
        <Prompt
          paragraphs={[
            'Hello! Want some free snacks? It just takes two people and a little game to get it.',
          ]}
          onClick={next}
        />
      );
    case State.ASK_FOR_NAME:
      return <Prompt paragraphs={['What is your name?']} onClick={next} />;
    case State.EYE:
      return <Pupil onClick={next} />;
  }
  return null;
};

render(<App />, document.getElementById('root'));
