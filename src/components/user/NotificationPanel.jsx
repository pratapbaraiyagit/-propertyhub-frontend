import { Box, Heading, Text, VStack, Button, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useNotifications from '../../hooks/useNotifications';

const NotificationPanel = ({ userId, onReadAll }) => {
  const allNotifications = useNotifications(userId);
  const [notifications, setNotifications] = useState([]);
  const bg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Sync notifications from hook
  useEffect(() => {
    if (allNotifications) setNotifications(allNotifications);
  }, [allNotifications]);

  if (!userId) return <Text>Loading notifications...</Text>;

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      await Promise.all(
        unread.map(n => axios.patch(`/notifications/${n._id}/read`))
      );

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      if (onReadAll) onReadAll(); // update badge in parent
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  return (
    <Box p={4} bg={bg} borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>🔔 Notifications</Heading>

      {notifications.length === 0 ? (
        <Text>No notifications yet.</Text>
      ) : (
        <>
          <Button size="sm" mb={4} colorScheme="secondary" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
          <VStack align="start" spacing={4}>
            {notifications.map(n => (
              <Box
                key={n._id}
                p={3}
                bg={n.isRead ? cardBg : useColorModeValue('primary.50', 'primary.700')} // highlight unread
                borderRadius="md"
                w="100%"
                boxShadow="sm"
              >
                <Text fontWeight="bold">{n.type.replace(/_/g, ' ')}</Text>
                <Text>{n.message}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(n.createdAt).toLocaleString()}
                </Text>
              </Box>
            ))}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default NotificationPanel;
