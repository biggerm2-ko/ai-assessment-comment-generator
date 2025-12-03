
export enum AppStep {
  InputForm = 1,
  Guidelines = 2,
  Results = 3,
}

export interface FormData {
  studentCount: string;
  subject: string;
  achievementStandard: string;
  evaluationFactor: string;
  evaluationTask: string;
  scoringCriteria: string;
  testOrWorksheet: string;
  studentData: string;
  exampleSentences: string;
  additionalMaterials: string;
  customGuidelines: string;
  commentLength: number; // Changed to number for slider
}

export interface NumberedComment {
  studentId: number;
  comment: string;
}

export interface GroupedComment {
    studentId: number;
    comment: string;
}

export interface GeneratedComments {
  numberedList: NumberedComment[];
  groupedByPerformance: {
    veryGood: GroupedComment[];
    good: GroupedComment[];
    average: GroupedComment[];
    needsImprovement: GroupedComment[];
  };
}

// AI 응답을 위한 새로운 타입 정의
export interface AIStudentComment {
  studentId: number;
  comment: string;
  performanceLevel: 'veryGood' | 'good' | 'average' | 'needsImprovement';
}