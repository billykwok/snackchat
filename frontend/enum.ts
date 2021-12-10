export const enum State {
  WAITING_FOR_FULLSCREEN = 0,
  INTRO = 1,
  PROMPT_FOR_QUESTION_LEFT = 2,
  PROMPT_FOR_ANSWER_LEFT = 3,
  PROMPT_FOR_QUESTION_RIGHT = 4,
  PROMPT_FOR_ANSWER_RIGHT = 5,
  DISPENSE = 6,
}

export const enum Question {
  TIME_TRAVEL = 0,
  FAVORITE_DISH = 1,
  NOT_ROBOT = 2,
  CRAZIEST_DREAM = 3,
}

export declare interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
