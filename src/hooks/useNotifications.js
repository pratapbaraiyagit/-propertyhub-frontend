import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!userId) return; // prevent invalid requests
      try {
        const res = await axios.get(`/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }

    fetchNotifications();
  }, [userId]);

  return notifications;
}
