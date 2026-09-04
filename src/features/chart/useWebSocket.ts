import { useEffect, useRef, useState } from 'react';
import { Client, type Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { CandleData } from './types';

interface UseWebSocketProps {
  stockCode: string;
  onCandleReceived: (candle: CandleData) => void;
}

export const useWebSocket = ({ stockCode, onCandleReceived }: UseWebSocketProps) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // SockJS 객체를 리턴하는 팩토리 함수 전달
    const socket = new SockJS('http://localhost:9100/ws-stomp');
    
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 자동 재연결 주기 (5초)
      debug: (str) => console.log('[STOMP Log]:', str),
      onConnect: () => {
        console.log('✅ WebSocket Connected!');
        setIsConnected(true);

        // 해당 종목의 실시간 캔들 데이터 구독
        client.subscribe(`/topic/chart/${stockCode}`, (message: Message) => {
          if (message.body) {
            const candle: CandleData = JSON.parse(message.body);
            onCandleReceived(candle);
          }
        });
      },
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message'], frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [stockCode]);

  // 클라이언트에서 서버로 메시지를 보낼 때 사용하는 함수
  const sendMessage = (destination: string, body: any) => {
    if (stompClientRef.current && isConnected) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  return { isConnected, sendMessage };
};