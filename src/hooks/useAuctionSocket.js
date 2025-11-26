// src/hooks/useAuctionSocket.js
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8080';
let socket;

export default function useAuctionSocket(onAuctionStatus) {
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, { transports: ['websocket'] });
    }
    socket.on('auctionStatus', onAuctionStatus);
    return () => {
      socket.off('auctionStatus', onAuctionStatus);
    };
  }, [onAuctionStatus]);
  return socket;
}
