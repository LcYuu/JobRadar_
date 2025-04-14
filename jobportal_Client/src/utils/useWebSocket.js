// useWebSocket.js
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useWebSocket = (topics, onMessageReceived) => {
  const clientRef = useRef(null); // Lưu trữ client để tái sử dụng
  const subscriptionsRef = useRef([]); // Lưu trữ subscriptions để hủy

  useEffect(() => {
    // Tạo WebSocket client nếu chưa tồn tại
    if (!clientRef.current) {
      const socket = new SockJS("http://localhost:8080/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.log("STOMP Debug:", str),
      });

      client.onConnect = (frame) => {
        console.log("WebSocket Connected:", frame);
        // Subscribe các topic
        topics.forEach((topic) => {
          // Kiểm tra xem topic đã được subscribe chưa
          if (!subscriptionsRef.current.some((sub) => sub.topic === topic)) {
            const subscription = client.subscribe(topic, (message) => {
              console.log(`Received from ${topic}:`, message.body);
              if (typeof onMessageReceived === "function") {
                onMessageReceived(client.store?.dispatch, message.body, topic); // Truyền dispatch nếu cần
              }
            });
            subscriptionsRef.current.push({ topic, subscription });
          }
        });
      };

      client.onStompError = (frame) => {
        console.error("STOMP Error:", frame.headers["message"], frame.body);
      };

      client.activate();
      clientRef.current = client; // Lưu client vào ref
    }

    // Cleanup khi component unmount
    return () => {
      const client = clientRef.current;
      if (client && client.connected) {
        subscriptionsRef.current.forEach(({ subscription }) => {
          subscription.unsubscribe(); // Hủy từng subscription
        });
        subscriptionsRef.current = []; // Reset subscriptions
        client.deactivate();
        console.log("WebSocket cleaned up");
        clientRef.current = null; // Reset client
      }
    };
  }, [topics, onMessageReceived]); // Dependency array

  // Truyền dispatch từ Redux nếu cần
  return (dispatch) => {
    if (clientRef.current) {
      clientRef.current.store = { dispatch }; // Lưu dispatch để dùng trong onMessageReceived
    }
  };
};

export default useWebSocket;