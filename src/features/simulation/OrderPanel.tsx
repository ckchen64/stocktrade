import React, { useState } from 'react';
import axios from 'axios';

// (GUI-TS-T1) 오직 "BUY"와 "SELL" 글자 외에는 절대 들어오지 못하도록 규격을 제한합니다.
type TradeType = "BUY" | "SELL";

interface OrderPanelProps {
    onOrderSuccess: () => void; // 🔄 주문 성공 시 부모 장부를 리프레시 시킬 스위치 배달 수령
}

export default function OrderPanel({ onOrderSuccess }: OrderPanelProps): React.JSX.Element {
    const [tradeType, setTradeType] = useState<TradeType>("BUY");

    // 🛠️ 보완: 숫자와 빈 값(undefined)을 모두 허용하도록 타입을 수정하고 올바른 초기값을 지정했습니다.
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [quantity, setQuantity] = useState<number | undefined>(undefined);
    const [resultMessage, setResultMessage] = useState<string>("");

    // ------------------------------------------------------------
    // 기능(함수): 백엔드로 주식 주문 전송 (Axios 캐치볼 엔진)
    // ------------------------------------------------------------
    const handleOrderSubmit = (): void => {
        console.log("🚀 [타입스크립트 화면] 주문 체결 프로세스를 개시합니다.");
        // 🛠️ 보완: 값이 비어있거나(undefined) 0 이하일 때의 예외 처리를 안전하게 강화했습니다.
        if (!price || !quantity || price <= 0 || quantity <= 0) {
            alert("⚠️ 올바른 가격과 수량을 입력하세요!");
            return;
        }

        // (GUI-TS-M1-3) [순차] 백엔드 컨트롤러 주소로 타입이 검증된 안전한 데이터를 전송합니다.
        axios.post<string>('http://localhost:9100/api/trade', null, {
            params: {
                type: tradeType, // "BUY" 또는 "SELL" 만 들어감 보장
                price: price,    // 무조건 숫자만 들어감 보장
                quantity: quantity // 무조건 숫자만 들어감 보장
            }
        })
            .then((response) => {
                // (GUI-TS-M1-4) [순차] 백엔드 스프링 부트로부터 받은 응답 영수증 매핑
                console.log("📬 [화면 로그] 백엔드로부터 안전하게 응답을 수신했습니다.");
                setResultMessage(response.data);
                onOrderSuccess(); // 🔔 대단히 중요: 부모가 준 스위치를 눌러 타임라인 표를 원격 리프레시 시킵니다!
            })
            .catch(() => { setResultMessage("❌ 주문 통신 오류가 발생했습니다."); });
    };

    // (GUI-SIM-M1-4) 화면 레이아웃 드로잉 구역
    // {/* ======================================================= */ }
    // {/* 구역 [B] : 기존에 완벽히 다듬어둔 모의 주식 주문 창 (기존 기능 유지) */ }
    // {/* ======================================================= */ }
    return (
        <div style={{ padding: '15px', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🛒 주식 주문 패널 [B]</h4>

            {/* 1. BUY, SELL 버튼 */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setTradeType("BUY")} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: tradeType === "BUY" ? "#dc3545" : "#6c757d", color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>BUY (매수)</button>
                <button onClick={() => setTradeType("SELL")} style={{ padding: '10px 20px', backgroundColor: tradeType === "SELL" ? "#007bff" : "#6c757d", color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>SELL (매도)</button>
            </div>

            {/* 2. 단가 입력 상자 */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>주문 단가 (원)</label>
                {/* 🛠️ 보완: placeholder 속성을 사용하고, 값이 undefined일 때는 빈 칸이 유지되도록 안전장치를 걸었습니다. */}
                <input
                    type="number"
                    placeholder="단가를 입력하세요"
                    value={price ?? ""}
                    onChange={(e) => setPrice(e.target.value === "" ? undefined : parseInt(e.target.value))}
                    style={{ width: '92%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            {/* 3. 수량 입력 상자 */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>주문 수량 (주)</label>
                {/* 🛠️ 보완: placeholder 속성을 사용하고, 값이 undefined일 때는 빈 칸이 유지되도록 안전장치를 걸었습니다. */}
                <input
                    type="number"
                    placeholder="수량을 입력하세요"
                    value={quantity ?? ""}
                    onChange={(e) => setQuantity(e.target.value === "" ? undefined : parseInt(e.target.value))}
                    style={{ width: '92%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            {/* 4. 최종 주문 제출 버튼 */}
            <button onClick={handleOrderSubmit} style={{ width: '98%', padding: '12px', backgroundColor: '#212529', color: 'white', fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {tradeType} 체결 요청하기
            </button>

            {/* 5. 최종 영수증 리포트 패널 구역 */}
            {resultMessage && (
                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderLeft: '5px solid #212529', borderRadius: '4px', fontSize: '12.5px', whiteSpace: 'pre-wrap' }}>
                    <strong>🧾 자산 정산 영수증:</strong><br />{resultMessage}
                </div>
            )}
        </div>
    );
}