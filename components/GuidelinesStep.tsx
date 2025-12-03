import React from 'react';
import { DEFAULT_GUIDELINES } from '../constants';
import type { FormData } from '../types';

interface GuidelinesStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const exampleText = "이 학생은 수학의 기본 개념을 충실히 이해하고 있으며, 특히 복잡한 문제 상황에서도 배운 지식을 창의적으로 적용하여 해결하는 능력이 돋보입니다. 꾸준한 노력과 탐구하는 자세를 바탕으로 앞으로 더 큰 성장이 기대됩니다.";

const GuidelinesStep: React.FC<GuidelinesStepProps> = ({ formData, updateFormData, onBack, onGenerate }) => {
  const { customGuidelines, commentLength } = formData;
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('commentLength', parseInt(e.target.value, 10));
  };

  const previewText = exampleText.substring(0, commentLength);
  const remainingText = exampleText.substring(commentLength);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-2">2단계: 가이드라인 확인</h2>
      <p className="text-center text-slate-500 mb-8">AI가 아래 유의사항을 지키며 평어를 작성합니다.</p>
      
      <div className="mb-8 p-6 bg-white/60 rounded-lg border border-rose-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">평어 길이 설정</h3>
        <div className="flex items-center gap-4 mb-4">
          <input
            id="commentLength"
            type="range"
            min="50"
            max="200"
            step="10"
            value={commentLength}
            onChange={handleSliderChange}
            className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'rgb(244 63 94)' }}
          />
          <span className="font-bold text-rose-600 text-lg w-24 text-center">{commentLength}자</span>
        </div>
        <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">길이 미리보기:</h4>
            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-md text-slate-700 text-sm leading-relaxed">
                <span className="text-rose-800 font-medium">{previewText}</span>
                <span className="text-slate-400">{remainingText}</span>
            </div>
        </div>
      </div>

      <div className="bg-rose-50/70 p-6 rounded-lg border border-rose-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">기본 작성 규칙</h3>
        <ul className="space-y-2 list-disc list-inside text-slate-600">
          {DEFAULT_GUIDELINES.map((guideline, index) => (
            <li key={index}>{guideline}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <label htmlFor="customGuidelines" className="block text-sm font-medium text-slate-700 mb-1">
          추가 유의사항 또는 수정 사항
        </label>
        <textarea
          id="customGuidelines"
          name="customGuidelines"
          value={customGuidelines}
          onChange={(e) => updateFormData('customGuidelines', e.target.value)}
          placeholder="AI에게 추가로 요청할 내용이 있다면 입력해 주세요. (예: 긍정적인 표현을 더 많이 사용해 주세요.)"
          rows={4}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white text-slate-800 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          이전
        </button>
        <button
          onClick={onGenerate}
          className="px-8 py-3 bg-rose-500 text-white font-bold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          평어 생성하기
        </button>
      </div>
    </div>
  );
};

export default GuidelinesStep;