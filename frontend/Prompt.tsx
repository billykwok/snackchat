import { css } from '@linaria/core';
import { useEffect } from 'react';

import { voice } from './speech';

export function Prompt({
  title,
  paragraphs = [],
  verbalInstructions = [],
  textOnly = [],
  ...rest
}: {
  paragraphs: string[];
  [key: string]: any;
}) {
  const text = [title, ...paragraphs, ...verbalInstructions];
  useEffect(() => {
    for (const p of text) {
      const utterance = new SpeechSynthesisUtterance(p);
      utterance.voice = voice;
      console.log(p);
      speechSynthesis.speak(utterance);
    }
    return () => {
      speechSynthesis.cancel();
    };
  }, [text]);
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
          margin: 4rem;
          text-align: center;
          font-size: 5rem;
          > p {
            margin-block-start: 0;
            margin-block-end: 3rem;
          }
        `}
      >
        <h1
          className={css`
            margin-bottom: 1.5rem;
          `}
        >
          {title}
        </h1>
        {paragraphs.concat(textOnly).map((p, i) => (
          <p
            key={i}
            className={css`
              font-size: 4rem;
            `}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
