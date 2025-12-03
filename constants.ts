import type { FormData } from './types';

export const DEFAULT_GUIDELINES: string[] = [
  "문장은 한 학생에 하나로 만듭니다.",
  "문장의 끝은 반드시 '~함', '~임' 등으로 마무리합니다.",
  "**금지 규칙:**\n- 문장의 끝에 '~할 수 있음'을 사용하지 않습니다.\n- 잘 쓰이지 않는 단어는 사용하지 않습니다.\n- 특수 기호는 사용하지 않습니다.",
  "교과에 어울리면서 전문적인 평가 용어를 사용합니다.",
  "모든 학생의 평어가 다르게 느껴지도록 동의어를 다양하게 사용하고, 문장의 순서나 구조 등을 변화시켜 작성합니다.",
  "각 평어는 '학생은' 또는 '이 학생은'과 같은 말로 시작하지 말고, 학생의 행동이나 성취에 대한 서술로 바로 시작하여 문장이 더 자연스럽고 다양하게 느껴지도록 합니다.",
  "각 평어는 학생의 행동이나 성취에 대한 서술로 바로 시작하여 자연스럽게 만들되, **시작하는 표현이 겹치지 않도록 명사, 동사구 등 다양한 방식으로 문장을 시작**해 주세요.",
  "**구체성과 근거 기반 서술:**\n- **학생의 성취를 평가 내용과 연결:** 단순히 '잘함' 또는 '부족함'으로 평가하지 말고, '평가문제/학습지 내용'과 '학생별 참고 자료'에 제시된 내용을 구체적으로 연결하여 서술해야 합니다. 학생이 **어떤 개념을 이해하고 어떤 기술을 수행했는지** 명확히 드러나게 작성합니다.\n- **추상적인 표현을 구체적인 서술로 변환:** 막연한 칭찬이나 지적 대신, 학생의 수행 과정을 묘사하는 방식으로 서술합니다. 예를 들면 다음과 같습니다.\n  - (기존의 막연한 표현): \"연산 능력이 뛰어남.\"\n  - (새로운 구체적 표현): \"**받아올림이 있는 두 자리 수 덧셈의 원리를 정확히 이해하고, 관련된 문제들을 실수 없이 해결함.**\"",
  "외래어는 순화된 한글 표현으로 하고, 띄어쓰기와 맞춤법을 한 번 더 확인합니다.",
  "**평가 수준(평가결과)에 관련된 규칙:**\n- 첨부된 파일 내용에 평가 수준(평가결과)가 표시되어 있으면 그대로 반영합니다.\n- 평가 수준(평가결과)가 첨부되지 않으면 다음 규칙을 따릅니다(매우 중요):\n  - '노력 요함(needsImprovement)' 등급: 학생 점수가 정확히 0점일 때 등 매우 제한적으로 사용합니다.\n  - '보통(average)' 등급: 0점이 아닌 학생 중 성적이 가장 낮은 1~2명에게 매우 제한적으로 사용합니다.\n  - '잘함(good)' 또는 '매우 잘함(veryGood)' 등급: 위의 두 경우를 제외한 모든 학생에게 되도록 상향 평가합니다.",
  "**문장 길이에 관한 규칙:**\n- 모든 평어는 내용을 풍부하게 만듭니다.\n- 평가 수준별 문장 길이는 다음 규칙을 절대적으로 준수해야 합니다.\n  - '매우 잘함'은 '잘함'보다 약 1.5배 길어야 합니다.\n  - 같은 평가 수준 내의 모든 문장은 바이트(byte) 수 기준으로 길이가 거의 동일해야 합니다(오차범위 ±5%). 예를 들어, '매우 잘함' 그룹의 한 학생의 평어가 100바이트라면, 같은 그룹의 다른 학생 평어들도 모두 95~105 바이트 사이여야 합니다. 뒷번호 학생의 문장이 짧아지는 경향이 없도록 모든 학생에게 동일한 길이 기준을 적용합니다.",
  "**긍정적 서술:** 모든 평가는 학생의 긍정적인 측면과 성장 가능성에 초점을 맞춥니다. 특히 '보통'이나 '노력 요함' 등급 학생에게는 '노력할 필요가 있음' 같은 부정적 표현을 절대 사용하지 않습니다. 대신 '이해하고 있음', '인지하고 있음', '기본적인 방법을 알고 있음'과 같이 학생이 성취한 부분을 중심으로 긍정적으로 서술합니다.",
];


interface InputField {
  id: keyof FormData;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  required: boolean;
}

export const SUBJECT_OPTIONS = [
  '국어', 
  '수학', 
  '사회', 
  '과학', 
  '도덕', 
  '실과', 
  '체육', 
  '음악', 
  '미술', 
  '영어', 
  '바른 생활', 
  '슬기로운 생활', 
  '즐거운 생활', 
  '안전한 생활', 
  '창체'
];
export const CUSTOM_SUBJECT = '임의입력';

export const INPUT_FIELDS: InputField[] = [
  { id: 'studentCount', label: '학생 수', placeholder: '예: 25', type: 'text', required: true },
  { id: 'subject', label: '교과', placeholder: '예: 국어, 수학', type: 'text', required: true },
  { id: 'achievementStandard', label: '성취기준', placeholder: '예: [4국01-01] 경험한 일을 나타내는 글을 쓸 때 겪은 일과 생각이나 느낌이 잘 드러나게 쓴다.', type: 'textarea', required: true },
  { id: 'evaluationFactor', label: '평가요소', placeholder: '예: 경험과 생각의 연결성, 표현의 적절성', type: 'textarea', required: false },
  { id: 'evaluationTask', label: '평가과제', placeholder: '예: 소중한 경험을 담은 그림일기 쓰기', type: 'textarea', required: false },
  { id: 'scoringCriteria', label: '채점기준', placeholder: '예: 상: 경험과 느낌을 구체적으로 표현함. 중: 경험은 드러나나 느낌 표현이 부족함. 하: 내용이 빈약함.', type: 'textarea', required: false },
  { id: 'testOrWorksheet', label: '평가문제 또는 학습지 내용', placeholder: '학습지나 평가문제의 핵심 내용을 입력하세요.', type: 'textarea', required: false },
  { id: 'studentData', label: '학생별 참고 자료', placeholder: "예:\n1번 김민준, 매우 잘함, 모든 문항 정답\n2번 이서연, 잘함, 3번 문항 오답\n3번 박도윤, 보통, 2, 4번 문항 오답\n(표 형식의 데이터를 붙여넣거나 직접 입력하세요)", type: 'textarea', required: true },
  { id: 'exampleSentences', label: '예시 문장', placeholder: '원하는 스타일의 예시 문장을 1~2개 입력하면 AI가 참고합니다. (선택 사항)', type: 'textarea', required: false },
  { id: 'additionalMaterials', label: '추가 자료', placeholder: '평어 작성에 참고할 추가 자료가 있다면 입력하세요. (선택 사항)', type: 'textarea', required: false },
];