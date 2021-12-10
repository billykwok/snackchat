import { Question, type SpeechRecognitionEvent } from './enum';

export function detectQuestion(e: SpeechRecognitionEvent): Question {
  for (const it of Array.from(e.results[e.resultIndex])) {
    if (
      ['do', 'time', 'travel'].every((tk) =>
        it.transcript.toLowerCase().includes(tk)
      )
    ) {
      return Question.TIME_TRAVEL;
    }
    if (
      ['favorite', 'dish'].every((tk) =>
        it.transcript.toLowerCase().includes(tk)
      )
    ) {
      return Question.FAVORITE_DISH;
    }
    if (
      ['proof', 'robot'].every((tk) =>
        it.transcript.toLowerCase().includes(tk)
      ) ||
      ['prove', 'robot'].every((tk) => it.transcript.toLowerCase().includes(tk))
    ) {
      return Question.NOT_ROBOT;
    }
    if (
      ['craziest', 'dream'].every((tk) =>
        it.transcript.toLowerCase().includes(tk)
      ) ||
      ['crazy', 'dream'].every((tk) => it.transcript.toLowerCase().includes(tk))
    ) {
      return Question.CRAZIEST_DREAM;
    }
  }
  return null;
}
