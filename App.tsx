import React, { useState, useCallback, useEffect } from 'react';
import InputFormStep from './components/InputFormStep';
import GuidelinesStep from './components/GuidelinesStep';
import ResultsStep from './components/ResultsStep';
import StepIndicator from './components/StepIndicator';
import { generateComments, regenerateSingleComment } from './services/geminiService';
import type { FormData, GeneratedComments } from './types';
import { AppStep } from './types';
import { INPUT_FIELDS } from './constants';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.InputForm);
  const [formData, setFormData] = useState<FormData>({
    studentCount: '',
    subject: '',
    achievementStandard: '',
    evaluationFactor: '',
    evaluationTask: '',
    scoringCriteria: '',
    testOrWorksheet: '',
    studentData: '',
    exampleSentences: '',
    additionalMaterials: '',
    customGuidelines: '',
    commentLength: 100, // Default length as a number
  });
  const [results, setResults] = useState<GeneratedComments | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('aiCommentGeneratorSaveData');
      setHasSavedData(!!savedData);
    } catch (e) {
      console.error("Could not access local storage:", e);
      setHasSavedData(false);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep < AppStep.Results) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > AppStep.InputForm) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const updateFormData = useCallback((field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    setCurrentStep(AppStep.Results);
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const generatedData = await generateComments(formData);
      setResults(generatedData);
    } catch (err) {
      if (err instanceof Error) {
        setError(`오류가 발생했습니다: ${err.message}. 잠시 후 다시 시도해 주세요.`);
      } else {
        setError("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateComment = async (studentId: number, modificationRequest: string): Promise<void> => {
    if (!results) return;

    const originalComment = results.numberedList.find(c => c.studentId === studentId)?.comment;
    if (!originalComment) {
      throw new Error("수정할 학생의 기존 평어를 찾을 수 없습니다.");
    }

    try {
      const newComment = await regenerateSingleComment(formData, originalComment, modificationRequest);
      setResults(prev => {
        if (!prev) return null;

        const newNumberedList = prev.numberedList.map(item =>
          item.studentId === studentId ? { ...item, comment: newComment } : item
        );

        const newGrouped = (Object.keys(prev.groupedByPerformance) as Array<keyof GeneratedComments['groupedByPerformance']>).reduce((acc, key) => {
          acc[key] = prev.groupedByPerformance[key].map(item =>
            item.studentId === studentId ? { ...item, comment: newComment } : item
          );
          return acc;
        }, {} as GeneratedComments['groupedByPerformance']);

        return {
          numberedList: newNumberedList,
          groupedByPerformance: newGrouped,
        };
      });
    } catch (err) {
      console.error("Error regenerating single comment:", err);
      throw err;
    }
  };

  const handleReset = () => {
    setFormData({
      studentCount: '',
      subject: '',
      achievementStandard: '',
      evaluationFactor: '',
      evaluationTask: '',
      scoringCriteria: '',
      testOrWorksheet: '',
      studentData: '',
      exampleSentences: '',
      additionalMaterials: '',
      customGuidelines: '',
      commentLength: 100,
    });
    setResults(null);
    setError(null);
    setIsLoading(false);
    setShowSplash(true);
  };
  
  const handleLoad = () => {
    try {
      const savedDataString = localStorage.getItem('aiCommentGeneratorSaveData');
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        setFormData(savedData.formData);
        setResults(savedData.results);
        setCurrentStep(AppStep.Results);
        setShowSplash(false);
      } else {
        alert("저장된 데이터가 없습니다.");
      }
    } catch (e) {
      console.error("Failed to load or parse data:", e);
      alert("데이터를 불러오는 데 실패했습니다. 데이터가 손상되었을 수 있습니다.");
      localStorage.removeItem('aiCommentGeneratorSaveData');
      setHasSavedData(false);
    }
  };

  const isInputStepValid = () => {
    return INPUT_FIELDS.filter(f => f.required).every(field => {
      const value = formData[field.id as keyof FormData];
      return typeof value === 'string' ? value.trim() !== '' : !!value;
    });
  };

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-rose-800">AI 수행평가 평어 작성기</h1>
        <p className="text-md text-slate-600 mt-4">v3.0 (최종 수정일: 2025년 11월 18일)</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <button
              onClick={() => setShowSplash(false)}
              className="px-8 py-3 bg-rose-500 text-white font-bold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
            >
              새로 시작하기
            </button>
            {hasSavedData && (
                <button
                  onClick={handleLoad}
                  className="px-8 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  이전 작업 불러오기
                </button>
            )}
        </div>
        <div className="mt-10 max-w-2xl text-left text-sm space-y-6">
            <div>
                <h3 className="font-semibold text-slate-700">주요 기능:</h3>
                <ul className="list-disc list-inside text-slate-600 mt-1">
                    <li>AI 기반 맞춤형 평어 생성 및 개별 재작성</li>
                    <li>다양한 파일 형식 지원 (PDF, DOCX, TXT)</li>
                    <li>글자 수 조절 슬라이더 및 길이 미리보기</li>
                    <li>작업 내용 저장 및 불러오기 기능</li>
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-slate-700"><span className="bg-rose-200 text-rose-800 font-bold px-2 py-1 rounded">New</span> v3.0 업데이트:</h3>
                <ul className="list-disc list-inside text-slate-600 mt-1">
                    <li>평어 길이 조절 방식을 세밀한 슬라이더로 변경</li>
                    <li>선택한 길이를 바로 체감할 수 있는 미리보기 기능 추가</li>
                    <li>작성하던 내용을 저장하고 다시 불러오는 기능 추가</li>
                </ul>
            </div>
        </div>
        <footer className="absolute bottom-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AI 수행평가 평어 작성기. All Rights Reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-rose-800">AI 수행평가 평어 작성기</h1>
        <p className="text-sm text-slate-600 mt-4">v3.0 (최종 수정일: 2025년 11월 18일)</p>
      </header>

      <main className="w-full max-w-4xl bg-rose-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 p-6 sm:p-8 md:p-10 transition-all duration-300">
        <StepIndicator currentStep={currentStep} />
        <div className="mt-8">
          {currentStep === AppStep.InputForm && (
            <InputFormStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNextStep}
              isValid={isInputStepValid()}
            />
          )}
          {currentStep === AppStep.Guidelines && (
            <GuidelinesStep
              formData={formData}
              updateFormData={updateFormData}
              onBack={handlePrevStep}
              onGenerate={handleGenerate}
            />
          )}
          {currentStep === AppStep.Results && (
            <ResultsStep
              isLoading={isLoading}
              error={error}
              results={results}
              formData={formData} // Pass formData for saving
              onReset={handleReset}
              onBack={handlePrevStep}
              onRegenerateComment={handleRegenerateComment}
            />
          )}
        </div>
      </main>
      
      <footer className="w-full max-w-4xl text-center mt-8 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI 수행평가 평어 작성기. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;