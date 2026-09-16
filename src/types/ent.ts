export type SubjectId =
  | 'history_kz'
  | 'reading'
  | 'math_lit'
  | 'math'
  | 'physics'
  | 'biology'
  | 'chemistry'
  | 'geography'
  | 'world_history';

export type DirectionId = 'fizmat' | 'biohim' | 'geomat';

export type QuestionType = 'single' | 'multiple' | 'context';

export interface Question {
  id: string;
  subjectId: SubjectId;
  direction?: 'fizmat' | 'biohim' | 'geomat' | 'all';
  type: QuestionType;
  points: number;
  contextText?: { ru: string; kk: string };
  question: { ru: string; kk: string };
  options: { ru: string[]; kk: string[] };
  correctIndexes: number[]; // Индекс(ы) правильного ответа
  explanation: { ru: string; kk: string };
}

export interface SubjectMeta {
  id: SubjectId;
  code: string;
  name: { ru: string; kk: string };
  shortName: { ru: string; kk: string };
  questionCount: number;
  maxPoints: number;
  isMandatory: boolean;
}

export interface DirectionConfig {
  id: DirectionId;
  name: { ru: string; kk: string };
  description: { ru: string; kk: string };
  profileSubject1: SubjectId;
  profileSubject2: SubjectId;
}

export interface MistakeRecord {
  mistakeId: string;
  questionId: string;
  subjectId: SubjectId;
  studentAnswerIndexes: number[];
  status: 'needs_review' | 'resolved';
  dateOccurred: string;
  attemptsCount: number;
}
