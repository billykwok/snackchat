import { css } from '@linaria/core';

export const Pupil = (props: Record<string, any>) => {
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
