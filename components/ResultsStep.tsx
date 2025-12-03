import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';
import type { GeneratedComments, GroupedComment, FormData } from '../types';

interface ResultsStepProps {
  isLoading: boolean;
  error: string | null;
  results: GeneratedComments | null;
  formData: FormData;
  onReset: () => void;
  onBack: () => void;
  onRegenerateComment: (studentId: number, modificationRequest: string) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

const ResultsStep: React.FC<ResultsStepProps> = ({ isLoading, error, results, formData, onReset, onBack, onRegenerateComment }) => {
  const [editableResults, setEditableResults] = useState<GeneratedComments | null>(results);
  const [editingState, setEditingState] = useState<{ studentId: number | null; request: string; isLoading: boolean; error: string | null }>({
    studentId: null,
    request: '',
    isLoading: false,
    error: null
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const modificationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditableResults(results);
  }, [results]);
  
  useEffect(() => {
    if (editingState.studentId !== null && modificationInputRef.current) {
      modificationInputRef.current.focus();
    }
  }, [editingState.studentId]);

  const handleCommentChange = (studentId: number, newComment: string) => {
    setEditableResults(prev => {
      if (!prev) return null;
      const newNumberedList = prev.numberedList.map(item =>
        item.studentId === studentId ? { ...item, comment: newComment } : item
      );
      const newGrouped: GeneratedComments['groupedByPerformance'] = {
        veryGood: prev.groupedByPerformance.veryGood.map(item => item.studentId === studentId ? { ...item, comment: newComment } : item),
        good: prev.groupedByPerformance.good.map(item => item.studentId === studentId ? { ...item, comment: newComment } : item),
        average: prev.groupedByPerformance.average.map(item => item.studentId === studentId ? { ...item, comment: newComment } : item),
        needsImprovement: prev.groupedByPerformance.needsImprovement.map(item => item.studentId === studentId ? { ...item, comment: newComment } : item),
      };
      return { numberedList: newNumberedList, groupedByPerformance: newGrouped };
    });
  };
  
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleRegenerateRequest = (studentId: number) => {
    setEditingState({ studentId, request: '', isLoading: false, error: null });
  };
  
  const handleRegenerateSubmit = async () => {
    if (!editingState.studentId || !editingState.request) return;
    setEditingState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await onRegenerateComment(editingState.studentId, editingState.request);
      setEditingState({ studentId: null, request: '', isLoading: false, error: null });
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
       setEditingState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  };
  
  const handleSave = () => {
    if (!editableResults) return;
    setSaveStatus('saving');
    try {
        const dataToSave = {
            formData,
            results: editableResults,
        };
        localStorage.setItem('aiCommentGeneratorSaveData', JSON.stringify(dataToSave));
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    } catch (e) {
        console.error("Failed to save data:", e);
        alert("데이터 저장에 실패했습니다. 브라우저 저장 공간이 부족할 수 있습니다.");
        setSaveStatus('idle');
    }
  };

  const renderComment = (student: { studentId: number; comment: string }) => {
    const isEditing = editingState.studentId === student.studentId;
    return (
      <div className="w-full">
        <textarea
          value={student.comment}
          onChange={(e) => handleCommentChange(student.studentId, e.target.value)}
          onInput={handleTextareaInput}
          rows={1}
          className="w-full p-2 bg-white/50 border border-transparent hover:border-rose-200 focus:border-rose-400 focus:bg-white rounded-md resize-none focus:outline-none transition-all duration-200"
        />
        {isEditing ? (
          <div className="mt-2 p-3 bg-rose-100/70 rounded-md">
            <input
              ref={modificationInputRef}
              type="text"
              value={editingState.request}
              onChange={(e) => setEditingState(prev => ({ ...prev, request: e.target.value }))}
              placeholder="수정 요청사항 입력 (예: 좀 더 긍정적으로)"
              className="w-full px-3 py-2 bg-white border border-rose-300 rounded-md shadow-sm text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleRegenerateSubmit()}
            />
            {editingState.error && <p className="text-red-600 text-xs mt-1">{editingState.error}</p>}
            <div className="flex items-center justify-end gap-2 mt-2">
               <button onClick={() => setEditingState({ studentId: null, request: '', isLoading: false, error: null })} className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded">취소</button>
               <button onClick={handleRegenerateSubmit} disabled={editingState.isLoading} className="px-3 py-1 text-xs text-white bg-rose-500 hover:bg-rose-600 rounded disabled:bg-slate-400 flex items-center">
                 {editingState.isLoading && <div className="w-3 h-3 border-2 border-t-white border-transparent rounded-full animate-spin mr-1"></div>}
                 재작성
               </button>
            </div>
          </div>
        ) : (
          <div className="text-right mt-1">
            <button onClick={() => handleRegenerateRequest(student.studentId)} className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-100 rounded-md transition-colors">
              수정 요청
            </button>
          </div>
        )}
      </div>
    );
  };
  

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">오류 발생</h2>
        <p className="text-slate-600 bg-red-50 p-4 rounded-md">{error}</p>
        <button onClick={onReset} className="mt-8 px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600">
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  if (!editableResults) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">생성된 결과가 없습니다.</h2>
        <p className="text-slate-600">정보를 입력하고 평어 생성을 시작해 주세요.</p>
        <button onClick={onReset} className="mt-8 px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600">
          새로 시작하기
        </button>
      </div>
    );
  }

  const formatNumberedListForCopy = () => editableResults?.numberedList.map(item => `${item.studentId}. ${item.comment}`).join('\n') || '';
  const formatGroupedListForCopy = () => {
    if (!editableResults) return '';
    let text = '';
    const { veryGood, good, average, needsImprovement } = editableResults.groupedByPerformance;
    if (veryGood.length > 0) text += `매우 잘함\n${veryGood.map(s => `- ${s.studentId}: ${s.comment}`).join('\n')}\n\n`;
    if (good.length > 0) text += `잘함\n${good.map(s => `- ${s.studentId}: ${s.comment}`).join('\n')}\n\n`;
    if (average.length > 0) text += `보통\n${average.map(s => `- ${s.studentId}: ${s.comment}`).join('\n')}\n\n`;
    if (needsImprovement.length > 0) text += `노력 요함\n${needsImprovement.map(s => `- ${s.studentId}: ${s.comment}`).join('\n')}\n\n`;
    return text.trim();
  };
  
  const saveButtonText = {
    idle: '진행 내용 저장하기',
    saving: '저장 중...',
    saved: '저장 완료!'
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-8">3단계: AI 평어 생성 결과</h2>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">번호순 결과</h3>
          <CopyButton textToCopy={formatNumberedListForCopy()} />
        </div>
        <div className="overflow-x-auto bg-rose-50/50 border border-rose-200 rounded-lg p-4 max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-rose-100 sticky top-0">
              <tr>
                <th className="p-3 w-16 text-rose-900 text-center">번호</th>
                <th className="p-3 text-rose-900">평어</th>
              </tr>
            </thead>
            <tbody>
              {editableResults.numberedList.map((item) => (
                <tr key={item.studentId} className="border-b border-rose-100 last:border-b-0">
                  <td className="p-3 font-medium text-slate-800 text-center align-top">{item.studentId}</td>
                  <td className="p-2 text-slate-700 leading-relaxed">{renderComment(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">평가결과별 결과</h3>
           <CopyButton textToCopy={formatGroupedListForCopy()} />
        </div>
        <div className="space-y-6 max-h-[50vh] overflow-y-auto">
          {Object.entries(editableResults.groupedByPerformance).map(([level, students]) => {
             const studentList = students as GroupedComment[];
             const levelMap: { [key: string]: string } = { veryGood: '매우 잘함', good: '잘함', average: '보통', needsImprovement: '노력 요함' };
             if (studentList.length === 0) return null;
             return (
                 <div key={level} className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                     <h4 className="font-semibold text-lg text-rose-700 mb-3">{levelMap[level]}</h4>
                     <ul className="space-y-3">
                         {studentList.map((student) => (
                             <li key={student.studentId} className="text-slate-700 flex items-start">
                                 <span className="font-semibold w-12 flex-shrink-0 pt-2">{student.studentId}:</span>
                                 {renderComment(student)}
                             </li>
                         ))}
                     </ul>
                 </div>
             )
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="px-6 py-2 w-full sm:w-auto bg-white text-slate-800 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          가이드라인 수정 및 전체 재작성
        </button>
         <button
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`px-6 py-2 w-full sm:w-auto font-semibold rounded-lg border transition-colors ${
            saveStatus === 'saved'
            ? 'bg-green-500 border-green-600 text-white'
            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
          }`}
        >
          {saveButtonText[saveStatus]}
        </button>
        <button
          onClick={onReset}
          className="px-8 py-3 w-full sm:w-auto bg-rose-500 text-white font-bold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          새로운 평어 작성하기
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;