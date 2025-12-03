import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeneratedComments, AIStudentComment } from '../types';
import { DEFAULT_GUIDELINES } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// AI가 생성할 단순화된 데이터 구조에 대한 스키마
const responseSchema = {
    type: Type.ARRAY,
    description: "모든 학생에 대한 평어 목록입니다. 반드시 학생 번호 순서대로 정렬되어야 합니다.",
    items: {
        type: Type.OBJECT,
        properties: {
            studentId: { type: Type.NUMBER, description: "학생의 고유 번호. 이 필드는 절대 누락되어서는 안 됩니다." },
            comment: { type: Type.STRING, description: "생성된 학생별 평어" },
            performanceLevel: { 
                type: Type.STRING, 
                description: "평가 수준. 'veryGood', 'good', 'average', 'needsImprovement' 중 하나여야 합니다.",
                enum: ['veryGood', 'good', 'average', 'needsImprovement']
            },
        },
        required: ["studentId", "comment", "performanceLevel"],
    }
};


export const generateComments = async (formData: FormData): Promise<GeneratedComments> => {
    const { customGuidelines, commentLength, ...contextData } = formData;
    
    const guidelines = [...DEFAULT_GUIDELINES];
    if (customGuidelines) {
        guidelines.push("--- 추가 사용자 요청사항 ---", customGuidelines);
    }
    
    // Add dynamic rule for comment length based on slider value
    guidelines.push(`**길이 특별 규칙:** 모든 평어는 약 ${commentLength}자 내외로 작성해 주세요. (오차범위 ±10%)`);


    const prompt = `
        초등학교 교사를 위한 학생별 평어 작성 AI로서, 아래 제공된 정보를 바탕으로 전문적이고 교육적인 평어를 생성해 주세요. 사용자가 입력한 내용은 절대 그대로 복사하지 말고, 모든 평어는 새롭게 작성해야 합니다.

        ### 평가 정보
        - 학생 수: ${contextData.studentCount}
        - 교과: ${contextData.subject}
        - 성취기준: ${contextData.achievementStandard || '제공되지 않음'}
        - 평가요소: ${contextData.evaluationFactor || '제공되지 않음'}
        - 평가과제: ${contextData.evaluationTask || '제공되지 않음'}
        - 채점기준: ${contextData.scoringCriteria || '제공되지 않음'}
        - 평가문제/학습지: ${contextData.testOrWorksheet || '제공되지 않음'}
        - 예시 문장: ${contextData.exampleSentences || '제공되지 않음'}
        - 추가 자료: ${contextData.additionalMaterials || '제공되지 않음'}

        ### 학생별 참고 자료
        ${contextData.studentData}

        ### 평어 작성 규칙 (반드시 엄수)
        ${guidelines.map(g => `- ${g}`).join('\n')}

        ### 최종 출력 지시 (가장 중요)
        - 위의 모든 정보를 종합하여, 각 학생에 대한 평어를 작성해 주세요.
        - 출력은 반드시 지정된 JSON 스키마를 완벽하게 따라야 합니다.
        - 결과는 **학생 번호 순서대로 정렬된** JSON 배열이어야 합니다.
        - 배열의 각 객체는 다음 세 가지 필드를 **반드시** 포함해야 합니다: 'studentId'(학생 번호), 'comment'(평어), 'performanceLevel'(평가 수준).
        - **'studentId' 필드는 모든 학생 객체에 대해 절대적으로 필수입니다. 이 필드가 없으면 결과는 무효입니다.**
        - 'performanceLevel' 필드에는 'veryGood', 'good', 'average', 'needsImprovement' 중 하나만 사용해야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        const aiResponse: AIStudentComment[] = Array.isArray(parsedJson) ? parsedJson : [];

        // AI 응답을 UI에서 사용하는 데이터 구조로 변환
        const finalResults: GeneratedComments = {
            numberedList: [],
            groupedByPerformance: {
                veryGood: [],
                good: [],
                average: [],
                needsImprovement: [],
            },
        };

        aiResponse.forEach((item, index) => {
            const studentId = item.studentId ?? index + 1;

            if (!item.comment || !item.performanceLevel) {
                console.warn(`Skipping incomplete record from AI for student index ${index}:`, item);
                return;
            }

            finalResults.numberedList.push({
                studentId: studentId,
                comment: item.comment,
            });

            const studentGroupItem = { studentId: studentId, comment: item.comment };
            switch (item.performanceLevel) {
                case 'veryGood':
                    finalResults.groupedByPerformance.veryGood.push(studentGroupItem);
                    break;
                case 'good':
                    finalResults.groupedByPerformance.good.push(studentGroupItem);
                    break;
                case 'average':
                    finalResults.groupedByPerformance.average.push(studentGroupItem);
                    break;
                case 'needsImprovement':
                    finalResults.groupedByPerformance.needsImprovement.push(studentGroupItem);
                    break;
                default:
                    finalResults.groupedByPerformance.good.push(studentGroupItem);
                    break;
            }
        });
        
        return finalResults;

    } catch (error) {
        console.error("Gemini API 호출 중 오류 발생:", error);
        throw new Error("AI 모델로부터 응답을 받는 데 실패했습니다.");
    }
};

export const regenerateSingleComment = async (
    formData: FormData,
    originalComment: string,
    modificationRequest: string
): Promise<string> => {
    const prompt = `
        초등학교 교사를 위한 AI 조교로서, 아래 주어진 학생 평어에 대한 교사의 수정 요청을 반영하여 새로운 평어를 작성해 주세요.

        ### 기존 평가 정보 (참고용)
        - 교과: ${formData.subject}
        - 성취기준: ${formData.achievementStandard}

        ### 수정 대상 평어
        "${originalComment}"

        ### 교사의 수정 요청사항
        "${modificationRequest}"

        ### 지시사항
        - 위의 '수정 요청사항'을 충실히 반영하여, '수정 대상 평어'를 개선한 **새로운 평어 하나만** 작성해 주세요.
        - 결과물은 오직 완성된 평어 문장이어야 합니다. 어떠한 설명이나 줄바꿈, 따옴표도 포함하지 마세요.
        - 기존 평어의 긍정적이고 전문적인 톤을 유지해야 합니다.
        - 문장의 끝은 반드시 '~함', '~임' 등으로 마무리해야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("단일 평어 재작성 중 Gemini API 오류 발생:", error);
        throw new Error("AI 모델과 통신 중 오류가 발생하여 평어를 수정하지 못했습니다.");
    }
};