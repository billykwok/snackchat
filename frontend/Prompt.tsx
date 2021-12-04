import { css } from '@linaria/core';
import { useEffect } from 'react';

import { voice } from './speech';

export function Prompt({
  paragraphs,
  ...rest
}: {
  paragraphs: string[];
  [key: string]: any;
}) {
  useEffect(() => {
    for (const p of paragraphs) {
      const utterance = new SpeechSynthesisUtterance(p);
      utterance.voice = voice;
      console.log(p);
      speechSynthesis.speak(utterance);
    }
  }, []);
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #fff;
        background: #000;
      `}
      {...rest}
    >
      <div
        className={css`
          display: block;
          margin: 8rem;
          text-align: center;
          font-size: 5rem;
          > p {
            margin-block-start: 0;
            margin-block-end: 3rem;
          }
        `}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
