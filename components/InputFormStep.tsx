import React, { useState } from 'react';
import type { FormData } from '../types';
import { INPUT_FIELDS, SUBJECT_OPTIONS, CUSTOM_SUBJECT } from '../constants';

// mammoth and pdfjs come from CDN scripts in index.html
declare const mammoth: any;
declare const pdfjsLib: any;

interface InputFormStepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
  onNext: () => void;
  isValid: boolean;
}

const InputFormStep: React.FC<InputFormStepProps> = ({ formData, updateFormData, onNext, isValid }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateFormData(e.target.name as keyof FormData, e.target.value);
  };

  const handleSubjectSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === CUSTOM_SUBJECT) {
        updateFormData('subject', '');
    } else {
        updateFormData('subject', value);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['txt', 'csv', 'pdf', 'docx'].includes(extension || '')) {
      alert('지원하지 않는 파일 형식입니다. .txt, .csv, .pdf, .docx 파일을 업로드해주세요.');
      return;
    }
    
    setIsProcessingFile(true);
    setFileName(file.name);
    
    try {
      let text = '';
      if (extension === 'txt' || extension === 'csv') {
        text = await file.text();
      } else if (extension === 'docx') {
        if (typeof mammoth === 'undefined') {
            throw new Error('Mammoth.js 라이브러리를 로드할 수 없습니다. 페이지를 새로고침 해주세요.');
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (extension === 'pdf') {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js 라이브러리를 로드할 수 없습니다. 페이지를 새로고침 해주세요.');
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        text = fullText;
      }
      updateFormData('studentData', text);
    } catch (error) {
      console.error('파일 처리 중 오류 발생:', error);
      alert(`파일을 처리하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
      setFileName(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isPredefinedSubject = SUBJECT_OPTIONS.includes(formData.subject);
  const subjectSelectValue = (formData.subject && !isPredefinedSubject) ? CUSTOM_SUBJECT : formData.subject;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-2">1단계: 평가 정보 입력</h2>
      <p className="text-center text-slate-500 mb-8">평어 생성에 필요한 정보를 입력해 주세요. 없는 정보는 비워두셔도 됩니다.</p>
      <div className="space-y-6">
        {INPUT_FIELDS.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.id === 'studentData' && (
              <div className="mb-2">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center group transition-colors ${isDragging ? 'border-rose-500 bg-rose-100/50' : 'border-slate-300 hover:border-rose-400'}`}
                >
                    <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-rose-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-slate-700">
                        {isProcessingFile ? (
                           <span className="text-slate-600">파일 처리 중...</span>
                        ) : fileName ? (
                            <span className="text-slate-800 font-medium">{fileName}</span>
                        ) : (
                            <>
                                <span className="text-rose-600 group-hover:underline cursor-pointer">파일 업로드</span> 또는 드래그 앤 드롭
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.csv,.pdf,.docx" />
                            </>
                        )}
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                        지원: TXT, CSV, PDF, DOCX
                    </p>
                </div>
              </div>
            )}
            
            {field.id === 'subject' ? (
              <>
                <select
                  id={field.id}
                  name={field.id}
                  value={subjectSelectValue}
                  onChange={handleSubjectSelectChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="" disabled>-- 교과를 선택해 주세요 --</option>
                  {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  <option value={CUSTOM_SUBJECT}>{CUSTOM_SUBJECT}</option>
                </select>
                {subjectSelectValue === CUSTOM_SUBJECT && (
                  <input
                    type="text"
                    id={`${field.id}-custom`}
                    name={field.id}
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="교과명을 직접 입력하세요."
                    className="w-full mt-2 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                )}
              </>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={field.id === 'studentData' ? 6 : 3}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            ) : (
              <input
                type="text"
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
       {!isValid && <p className="text-right mt-2 text-sm text-red-500">필수 항목(*)을 모두 입력해 주세요.</p>}
    </div>
  );
};

export default InputFormStep;