import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Spinner,
  Flex,
  HStack,
  Avatar,
  Divider,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaGavel, FaBell } from 'react-icons/fa';

import ProfileTab from '../components/user/ProfileTab';
import MyBidsTab from '../components/user/MyBidsTab';
import MyWinsTab from '../components/user/MyWinsTab';
import VisitRequestsTab from '../components/user/VisitRequestsTab';
import NotificationPanel from '../components/user/NotificationPanel';
import useNotifications from '../hooks/useNotifications';
import ErrorBoundary from '../components/common/ErrorBoundary'; // Add your ErrorBoundary component

const UserDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const sectionPadding = { base: 4, md: 6 };
  const fontSize = { base: 'sm', md: 'md' };

  // Safe fetching notifications
  const allNotifications = useNotifications(user ? user._id : null);
  const unreadCount = allNotifications ? allNotifications.filter(n => !n.isRead).length : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Container centerContent py={10}>
        <Heading size="md" mb={4}>Access Denied</Heading>
        <Text mb={4}>You must be logged in to view this page.</Text>
        <Button as={RouterLink} to="/login" colorScheme="secondary">Go to Login</Button>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxW="container.lg" py={{ base: 6, md: 12 }}>
        <VStack spacing={8} align="stretch">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
            <HStack spacing={4}>
              <Avatar size="xl" name={user.name} bg="primary.500" color="white" />
              <VStack align="flex-start" spacing={0}>
                <Heading as="h1" size={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                  Welcome, {user.name || user.email}
                </Heading>
                <Text color="gray.500" fontSize={fontSize}>
                  Manage your account and activities.
                </Text>
              </VStack>
            </HStack>
            <Button
              leftIcon={<FaSignOutAlt />}
              colorScheme="red"
              variant="outline"
              onClick={handleLogout}
              mt={{ base: 4, md: 0 }}
              w={{ base: 'full', md: 'auto' }}
            >
              Logout
            </Button>
          </Flex>

          <Divider />

          <Tabs isFitted variant="enclosed-colored" colorScheme="secondary">
            <TabList mb="1em" flexWrap="wrap">
              <Tab fontSize={fontSize}>Profile</Tab>
              <Tab fontSize={fontSize}>My Visits</Tab>
              <Tab fontSize={fontSize}>My Auctions</Tab>
              <Tab fontSize={fontSize}>
                <HStack spacing={2} position="relative">
                  <Icon as={FaBell} />
                  <Text>Notifications</Text>
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      fontSize="0.7em"
                      colorScheme="red"
                      borderRadius="full"
                      px={2}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <ProfileTab user={user} />
              </TabPanel>

              <TabPanel p={0}>
                <Box p={sectionPadding} bg={cardBg} boxShadow="md" borderRadius="lg">
                  <VisitRequestsTab />
                </Box>
              </TabPanel>

              <TabPanel p={0}>
                <Box p={sectionPadding} bg={cardBg} boxShadow="md" borderRadius="lg">
                  <HStack mb={4} spacing={3}>
                    <Icon as={FaGavel} w={6} h={6} color="gray.400" />
                    <Heading as="h2" size="md">Your Auction Activity</Heading>
                  </HStack>
                  <Tabs isLazy colorScheme="primary" variant="enclosed" size={fontSize}>
                    <TabList>
                      <Tab fontSize={fontSize}>My Bids</Tab>
                      <Tab fontSize={fontSize}>Auction Wins</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4} pb={2}>
                        <MyBidsTab />
                      </TabPanel>
                      <TabPanel px={0} pt={4} pb={2}>
                        <MyWinsTab />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </TabPanel>

              <TabPanel p={0}>
                <Box p={sectionPadding} bg={cardBg} boxShadow="md" borderRadius="lg">
                  <NotificationPanel userId={user._id} />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </ErrorBoundary>
  );
};

export default UserDashboard;
