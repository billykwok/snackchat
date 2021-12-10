import { css } from '@linaria/core';
import { useCallback, useEffect } from 'react';
import { useInterval } from 'react-use';

import { voice } from './speech';

export const Pupil = ({
  verbalInstructions = [],
  ...props
}: {
  verbalInstructions?: string[];
  [key: string]: any;
}) => {
  const speak = useCallback(() => {
    for (const p of verbalInstructions) {
      const utterance = new SpeechSynthesisUtterance(p);
      utterance.voice = voice;
      console.log(p);
      speechSynthesis.speak(utterance);
    }
  }, [verbalInstructions]);
  useInterval(speak, 20000);
  useEffect(() => {
    speak();
    return () => {
      speechSynthesis.cancel();
    };
  });
  return (
    <svg
      className={css`
        width: 100%;
      `}
      viewBox="0 0 640 840"
      fill="none"
      {...props}
    >
      <ellipse cx="420" cy="540" rx="100" ry="200" fill="#fff" />
    </svg>
  );
};
