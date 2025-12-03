import React from 'react';

const LoadingSpinner: React.FC = () => {
    const cyclingMessages = [
        "AI가 학생별 데이터를 분석하고 있습니다...",
        "전문적인 교육 용어를 선택하는 중입니다...",
        "학생 개개인의 특성에 맞는 문장을 생성하고 있습니다...",
        "맞춤법과 문장 구조를 검토하고 있습니다...",
    ];
    
    const [message, setMessage] = React.useState(cyclingMessages[0]);
    const messageIndexRef = React.useRef(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            messageIndexRef.current = (messageIndexRef.current + 1) % cyclingMessages.length;
            setMessage(cyclingMessages[messageIndexRef.current]);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 border-4 border-t-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
            <h2 className="mt-6 text-xl font-semibold text-slate-700">평어를 생성하는 중입니다...</h2>
            <p className="mt-2 text-slate-500 text-center">{message}</p>
        </div>
    );
};

export default LoadingSpinner;