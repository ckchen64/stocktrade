// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// interface ConsoleProps {
//     // ⭕ 부모 지휘소에서 보내준 차트 갱신 스위치 통로 명시
//     onSimulationAdvance?: (newCandleFromServer: any) => void;
//     // 🎯 [버그 해결 핵심]: 부모가 관리하는 지표 상태와 변경 함수를 Props로 주입받습니다.
//     selectedIndicators: string[];
//     setSelectedIndicators: React.Dispatch<React.SetStateAction<string[]>>;
// }

// // export default function SimulationConsole({ onSimulationAdvance }: ConsoleProps): React.JSX.Element {
// export default function SimulationConsole({ selectedIndicators, setSelectedIndicators, onSimulationAdvance }: ConsoleProps): React.JSX.Element {
//     // 📦 [독립 상태]: 콘솔의 리포트창과 재생 상태는 내부에서 독립적으로 관리합니다.
//     const [simReport, setSimReport] = useState<string>("");
//     const [isPlaying, setIsPlaying] = useState<boolean>(false);
//     // 🎯 [교정 1]: 브라우저(Window) 환경의 타이머 ID 타입을 명확히 지정하여 메모리 누수 차단
//     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//     // ------------------------------------------------------------
//     // ⚙️ 핵심 교정 구역: 백엔드 주머니(Map)를 열어 차트와 텍스트로 분배
//     // ------------------------------------------------------------
//     const handleNextDaySimulation = (): void => {
//         // 🚨 [디버깅 알람] 이제 버튼을 누르면 이 로그가 정상적으로 출력됩니다!
//         console.log("📡 [관제탑] 자식 콘솔에서 백엔드로 전진 신호 송신 시작...");

//         axios.get<any>('http://localhost:9100/api/simulation', { params: { code: "005930" } })
//             .then((response) => {
//                 const data = response.data;

//                 console.log("📥 [도킹 응답 완료] 백엔드에서 날아온 주머니 데이터:", data);

//                 // 🎯 [교정 2]: 백엔드 데이터 소진("END") 신호가 오면 즉시 타이머를 완전히 파괴하여 좀비 요청 차단!
//                 if (data.status === "END") {
//                     setSimReport(data.message || "🏁 모든 시뮬레이션 데이터가 소모되었습니다.");

//                     if (timerRef.current) {
//                         window.clearInterval(timerRef.current); // 확실하게 브라우저 타이머 제거
//                         timerRef.current = null;
//                     }
//                     setIsPlaying(false);

//                     // 💡 부모에게도 종료 상태를 전달하여 프론트엔드 전체 시스템을 프리징(정지)시킵니다.
//                     if (onSimulationAdvance) {
//                         onSimulationAdvance({ status: "END" });
//                     }
//                     return;
//                 }

//                 // 1️⃣ 하단 텍스트 패널에 보고서 글자 출력
//                 setSimReport(data.reportText);

//                 // 2️⃣ ⭐ [핵심 수정]: 요청하신 보조지표 필드들까지 전부 주머니에 싸서 부모(StockExchange)로 토스합니다!
//                 //여기에 데이터를 이식해 주지 않으면, 아무리 백엔드에서 값을 계산하고 부모가 받을 준비를 마쳤더라도 중간에서 데이터가 유실되게 됩니다.
//                 if (onSimulationAdvance && data.status === "SUCCESS") {
//                     onSimulationAdvance({
//                         date: data.date,
//                         open: data.open,
//                         high: data.high,
//                         low: data.low,
//                         close: data.close,
//                         volume: data.volume,

//                         // 이동평균선 라인
//                         sma05: data.sma05,
//                         sma20: data.sma20,
//                         sma60: data.sma60,

//                         // 보조지표 패널 A, B 데이터
//                         macd: data.macd,
//                         macdSignal: data.macdSignal,
//                         rsi: data.rsi,
//                         obv: data.obv,
//                         mfi: data.mfi,   // 💡 MFI 수치 안착
//                         sigma: data.sigma, // 🎯 시그마 변동성 안착 (주석 교정)

//                         // 🧬 [전격 도킹]: 백엔드에서 실시간으로 쏘아주는 DMI & ADX 수치 동기화
//                         adx: data.adx,
//                         diPlus: data.diPlus,
//                         diMinus: data.diMinus,

//                         cci: data.cci,
//                         cciSignal: data.cciSignal

//                     });
//                 }
//             })
//             .catch((error) => {
//                 console.error("❌ 시뮬레이션 통신 에러 상세:", error);
//                 setSimReport("❌ 시뮬레이션 통신 오류 발생 (서버 응답 규격 불일치)");

//                 // 에러 발생 시에도 안전을 위해 자동 재생을 정지시키는 것이 좋습니다.
//                 if (timerRef.current) {
//                     window.clearInterval(timerRef.current);
//                     timerRef.current = null;
//                 }
//                 setIsPlaying(false);
//             });
//     };

//     // ⚡ [버그 해결 핵심]: 체크박스를 누를 때 배열에 지표를 넣었다 빼는 핸들러 함수 구현
//     const handleIndicatorChange = (indicator: string) => {
//         setSelectedIndicators((prev) => {
//             if (prev.includes(indicator)) {
//                 // 이미 켜져 있다면 리스트에서 제거 (Toggle Off)
//                 return prev.filter((item) => item !== indicator);
//             } else {
//                 // 꺼져 있다면 리스트에 추가 (Toggle On)
//                 return [...prev, indicator];
//             }
//         });
//     };

//     // 자동 플레이 제어 스위치
//     const toggleAutoPlay = (): void => {
//         if (!isPlaying) {
//             setIsPlaying(true);
//             // 🎯 [교정 3]: 브라우저 컨텍스트임을 보장하기 위해 window.setInterval 명시
//             timerRef.current = window.setInterval(() => {
//                 handleNextDaySimulation();
//             }, 1000);
//         } else {
//             if (timerRef.current) {
//                 clearInterval(timerRef.current);
//                 timerRef.current = null;
//             }
//             setIsPlaying(false);
//         }
//     };

//     useEffect(() => {
//         return () => {
//             if (timerRef.current) window.clearInterval(timerRef.current);
//         };
//     }, []);

//     return (
//         <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
//             <h4 style={{ margin: '0 0 10px 0', color: '#495057', textAlign: 'center' }}>⚙️ 보조지표 [A] 및 제어 센터</h4>

//             <div style={{ display: 'flex', gap: '10px', fontSize: '12px', marginBottom: '15px', justifyContent: 'center', color: '#6c757d', flexWrap: 'wrap' }}>
//                 <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> SMA(이평선)</label>
//                 <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> MACD(추세)</label>
//                 <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> OBV(거래량)</label>

//                 {/* 실시간 켜고 꺼짐이 연동되는 스마트 체크박스들 */}
//                 <label style={{ cursor: 'pointer', color: selectedIndicators.includes("RSI") ? '#2cc54d' : '#6c757d', fontWeight: selectedIndicators.includes("RSI") ? 'bold' : 'normal' }}>
//                     <input type="checkbox" checked={selectedIndicators.includes("RSI")} onChange={() => handleIndicatorChange("RSI")} /> RSI(단기심리)
//                 </label>
//                 <label style={{ cursor: 'pointer', color: selectedIndicators.includes("MFI") ? '#e83e8c' : '#6c757d', fontWeight: selectedIndicators.includes("MFI") ? 'bold' : 'normal' }}>
//                     <input type="checkbox" checked={selectedIndicators.includes("MFI")} onChange={() => handleIndicatorChange("MFI")} /> MFI(자금흐름)
//                 </label>
//                 <label style={{ cursor: 'pointer', color: selectedIndicators.includes("SIGMA") ? '#007bff' : '#6c757d', fontWeight: selectedIndicators.includes("SIGMA") ? 'bold' : 'normal' }}>
//                     <input type="checkbox" checked={selectedIndicators.includes("SIGMA")} onChange={() => handleIndicatorChange("SIGMA")} /> SIGMA(변동성)
//                 </label>
//                 <label style={{ cursor: 'pointer', color: selectedIndicators.includes("ADX") ? '#af5288' : '#6c757d', fontWeight: selectedIndicators.includes("ADX") ? 'bold' : 'normal' }}>
//                     <input type="checkbox" checked={selectedIndicators.includes("ADX")} onChange={() => handleIndicatorChange("ADX")} /> ADX(매수강도)
//                 </label>
//             </div> {/* 👈 누락되어 밀리던 닫는 태그 수선 완료 */}

//             <div style={{ display: 'flex', gap: '10px' }}>
//                 <button onClick={toggleAutoPlay} style={{ flex: 2, padding: '12px', backgroundColor: isPlaying ? '#ffc107' : '#28a745', color: isPlaying ? '#212529' : 'white', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                     {isPlaying ? "⏸️ 일시 정지" : "▶️ 자동 플레이"}
//                 </button>
//                 <button onClick={handleNextDaySimulation} disabled={isPlaying} style={{ flex: 1, padding: '12px', backgroundColor: isPlaying ? '#e9ecef' : '#007bff', color: isPlaying ? '#6c757d' : 'white', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: isPlaying ? 'not-allowed' : 'pointer' }}>
//                     🗓️ 수동 전진
//                 </button>
//             </div>

//             {simReport && (
//                 <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: '5px solid #28a745', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
//                     <strong>📜 실시간 보조지표 리포트:</strong>
//                     <div style={{ marginTop: '5px', color: '#333' }}>{simReport}</div>
//                 </div>
//             )}
//         </div>
//     );
// }






import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface ConsoleProps {
    // ⭕ 부모 지휘소에서 보내준 차트 갱신 스위치 통로 명시
    onSimulationAdvance?: (newCandleFromServer: any) => void;
    // 🎯 [버그 해결 핵심]: 부모가 관리하는 지표 상태와 변경 함수를 Props로 주입받습니다.
    selectedIndicators: string[];
    setSelectedIndicators: React.Dispatch<React.SetStateAction<string[]>>;
}

// export default function SimulationConsole({ onSimulationAdvance }: ConsoleProps): React.JSX.Element {
export default function SimulationConsole({ selectedIndicators, setSelectedIndicators, onSimulationAdvance }: ConsoleProps): React.JSX.Element {
    // 📦 [독립 상태]: 콘솔의 리포트창과 재생 상태는 내부에서 독립적으로 관리합니다.
    const [simReport, setSimReport] = useState<string>("");
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    // 🎯 [교정 1]: 브라우저(Window) 환경의 타이머 ID 타입을 명확히 지정하여 메모리 누수 차단
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ------------------------------------------------------------
    // ⚙️ 핵심 교정 구역: 백엔드 주머니(Map)를 열어 차트와 텍스트로 분배
    // ------------------------------------------------------------
    const handleNextDaySimulation = (): void => {
        // 🚨 [디버깅 알람] 이제 버튼을 누르면 이 로그가 정상적으로 출력됩니다!
        console.log("📡 [관제탑] 자식 콘솔에서 백엔드로 전진 신호 송신 시작...");

        axios.get<any>('http://localhost:9100/api/simulation', { params: { code: "005930" } })
            .then((response) => {
                const data = response.data;

                console.log("📥 [도킹 응답 완료] 백엔드에서 날아온 주머니 데이터:", data);

                // 🎯 [교정 2]: 백엔드 데이터 소진("END") 신호가 오면 즉시 타이머를 완전히 파괴하여 좀비 요청 차단!
                if (data.status === "END") {
                    setSimReport(data.message || "🏁 모든 시뮬레이션 데이터가 소모되었습니다.");

                    if (timerRef.current) {
                        window.clearInterval(timerRef.current); // 확실하게 브라우저 타이머 제거
                        timerRef.current = null;
                    }
                    setIsPlaying(false);

                    // 💡 부모에게도 종료 상태를 전달하여 프론트엔드 전체 시스템을 프리징(정지)시킵니다.
                    if (onSimulationAdvance) {
                        onSimulationAdvance({ status: "END" });
                    }
                    return;
                }

                // 1️⃣ 하단 텍스트 패널에 보고서 글자 출력
                setSimReport(data.reportText);

                // 2️⃣ ⭐ [핵심 수정]: 요청하신 보조지표 필드들까지 전부 주머니에 싸서 부모(StockExchange)로 토스합니다!
                //여기에 데이터를 이식해 주지 않으면, 아무리 백엔드에서 값을 계산하고 부모가 받을 준비를 마쳤더라도 중간에서 데이터가 유실되게 됩니다.
                if (onSimulationAdvance && data.status === "SUCCESS") {
                    onSimulationAdvance({
                        date: data.date,
                        open: data.open,
                        high: data.high,
                        low: data.low,
                        close: data.close,
                        volume: data.volume,

                        // 이동평균선 라인
                        sma05: data.sma05,
                        sma20: data.sma20,
                        sma60: data.sma60,

                        // 보조지표 패널 A, B 데이터
                        macd: data.macd,
                        macdSignal: data.macdSignal,
                        rsi: data.rsi,
                        obv: data.obv,
                        mfi: data.mfi,   // 💡 MFI 수치 안착
                        sigma: data.sigma, // 🎯 시그마 변동성 안착 (주석 교정)

                        // 🧬 [전격 도킹]: 백엔드에서 실시간으로 쏘아주는 DMI & ADX 수치 동기화
                        adx: data.adx,
                        diPlus: data.diPlus,
                        diMinus: data.diMinus,

                        cci: data.cci,
                        cciSignal: data.cciSignal

                    });
                }
            })
            .catch((error) => {
                console.error("❌ 시뮬레이션 통신 에러 상세:", error);
                setSimReport("❌ 시뮬레이션 통신 오류 발생 (서버 응답 규격 불일치)");

                // 에러 발생 시에도 안전을 위해 자동 재생을 정지시키는 것이 좋습니다.
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsPlaying(false);
            });
    };

    // ⚡ [버그 해결 핵심]: 체크박스를 누를 때 배열에 지표를 넣었다 빼는 핸들러 함수 구현
    const handleIndicatorChange = (indicator: string) => {
        setSelectedIndicators((prev) => {
            if (prev.includes(indicator)) {
                // 이미 켜져 있다면 리스트에서 제거 (Toggle Off)
                return prev.filter((item) => item !== indicator);
            } else {
                // 꺼져 있다면 리스트에 추가 (Toggle On)
                return [...prev, indicator];
            }
        });
    };

    // 자동 플레이 제어 스위치
    const toggleAutoPlay = (): void => {
        if (!isPlaying) {
            setIsPlaying(true);
            // 🎯 [교정 3]: 브라우저 컨텍스트임을 보장하기 위해 window.setInterval 명시
            timerRef.current = window.setInterval(() => {
                handleNextDaySimulation();
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057', textAlign: 'center' }}>⚙️ 보조지표 [A] 및 제어 센터</h4>

            <div style={{ display: 'flex', gap: '10px', fontSize: '12px', marginBottom: '15px', justifyContent: 'center', color: '#6c757d', flexWrap: 'wrap' }}>
                <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> SMA(이평선)</label>
                <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> MACD(추세)</label>
                <label style={{ cursor: 'pointer' }}><input type="checkbox" defaultChecked disabled /> OBV(거래량)</label>

                {/* 실시간 켜고 꺼짐이 연동되는 스마트 체크박스들 */}
                <label style={{ cursor: 'pointer', color: selectedIndicators.includes("RSI") ? '#2cc54d' : '#6c757d', fontWeight: selectedIndicators.includes("RSI") ? 'bold' : 'normal' }}>
                    <input type="checkbox" checked={selectedIndicators.includes("RSI")} onChange={() => handleIndicatorChange("RSI")} /> RSI(단기심리)
                </label>
                <label style={{ cursor: 'pointer', color: selectedIndicators.includes("MFI") ? '#e83e8c' : '#6c757d', fontWeight: selectedIndicators.includes("MFI") ? 'bold' : 'normal' }}>
                    <input type="checkbox" checked={selectedIndicators.includes("MFI")} onChange={() => handleIndicatorChange("MFI")} /> MFI(자금흐름)
                </label>
                <label style={{ cursor: 'pointer', color: selectedIndicators.includes("SIGMA") ? '#007bff' : '#6c757d', fontWeight: selectedIndicators.includes("SIGMA") ? 'bold' : 'normal' }}>
                    <input type="checkbox" checked={selectedIndicators.includes("SIGMA")} onChange={() => handleIndicatorChange("SIGMA")} /> SIGMA(변동성)
                </label>
                <label style={{ cursor: 'pointer', color: selectedIndicators.includes("ADX") ? '#af5288' : '#6c757d', fontWeight: selectedIndicators.includes("ADX") ? 'bold' : 'normal' }}>
                    <input type="checkbox" checked={selectedIndicators.includes("ADX")} onChange={() => handleIndicatorChange("ADX")} /> ADX(매수강도)
                </label>
            </div> {/* 👈 누락되어 밀리던 닫는 태그 수선 완료 */}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={toggleAutoPlay} style={{ flex: 2, padding: '12px', backgroundColor: isPlaying ? '#ffc107' : '#28a745', color: isPlaying ? '#212529' : 'white', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    {isPlaying ? "⏸️ 일시 정지" : "▶️ 자동 플레이"}
                </button>
                <button onClick={handleNextDaySimulation} disabled={isPlaying} style={{ flex: 1, padding: '12px', backgroundColor: isPlaying ? '#e9ecef' : '#007bff', color: isPlaying ? '#6c757d' : 'white', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: isPlaying ? 'not-allowed' : 'pointer' }}>
                    🗓️ 수동 전진
                </button>
            </div>

            {simReport && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: '5px solid #28a745', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    <strong>📜 실시간 보조지표 리포트:</strong>
                    <div style={{ marginTop: '5px', color: '#333' }}>{simReport}</div>
                </div>
            )}
        </div>
    );
}