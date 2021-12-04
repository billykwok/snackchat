import { css } from '@linaria/core';

export const Pupil = (props: Record<string, any>) => {
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        background: #fff;
      `}
      {...props}
    >
      <svg width="640" height="840" viewBox="0 0 640 840" fill="none">
        <ellipse cx="320" cy="420" rx="320" ry="420" fill="#000" />
        <ellipse cx="457" cy="543" rx="60" ry="120" fill="#fff" />
      </svg>
    </div>
  );
};
