import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.InputForm, name: '정보 입력' },
  { id: AppStep.Guidelines, name: '가이드라인 확인' },
  { id: AppStep.Results, name: '결과 확인' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.name} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                  isCurrent
                    ? 'border-rose-500'
                    : isCompleted
                    ? 'border-rose-500'
                    : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isCurrent || isCompleted
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  단계 {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-800">{step.name}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;