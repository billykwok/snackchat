import { css } from '@linaria/core';

export function Prompt({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      `}
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
        {paragraphs.map((p) => (
          <p>{p}</p>
        ))}
      </div>
    </div>
  );
}
