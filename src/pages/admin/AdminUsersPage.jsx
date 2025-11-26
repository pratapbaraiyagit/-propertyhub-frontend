import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  HStack,
  VStack, // Added VStack for vertical stacking of buttons on mobile
  Tag,
  useToast,
  Flex,
  Tooltip,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { FaUserShield, FaUser } from 'react-icons/fa';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load users.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivateClick = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const confirmDeactivate = async () => {
    if (!selectedUser) return;

    try {
      await axios.patch(`/admin/users/${selectedUser._id}/status`, { active: false });
      toast({
        title: 'User Deactivated',
        description: `User ${
          selectedUser.name || selectedUser.email
        } has been deactivated.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Re-fetch users to show the updated status
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update user status.';
      toast({
        title: 'Action Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSelectedUser(null);
    }
  };

  const handleToggleActive = async (userId, userName, isActive) => {
    if (isActive) {
      const userToDeactivate = users.find((u) => u._id === userId);
      if (userToDeactivate) {
        handleDeactivateClick(userToDeactivate);
      }
      return;
    }

    // Directly activate the user without confirmation
    try {
      await axios.patch(`/admin/users/${userId}/status`, { active: true });
      toast({
        title: 'User Activated',
        description: `User ${userName || userId} has been activated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Re-fetch users to show the updated status
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update user status.';
      toast({
        title: 'Action Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="calc(100vh - 200px)">
        <Spinner size="xl" /> <Text ml={3}>Loading Users...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box
        p={5}
        minHeight="calc(100vh - 200px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          py={10}
          px={6}
          borderRadius="md"
          maxWidth="md"
          width="100%"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={2} fontSize="xl">
            Error Loading Users
          </AlertTitle>
          <AlertDescription maxWidth="sm">{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box
        w={{ base: '100vw', md: '99vw' }} // Full width on mobile, slightly less on desktop
        maxW={{ base: 'none', md: '100vw' }} // No max-width restriction on mobile
        px={0} // Remove padding on x-axis for smallest screens
        mx={0} // Remove margin on x-axis for smallest screens
        p={{ base: 2, md: 4 }} // More padding on larger screens
        minH="100vh"
        overflowX="auto" // Allow horizontal scrolling for the entire container if needed
      >
        <Heading mb={6} textAlign={{ base: 'center', md: 'left' }}> {/* Center on mobile */}
          Manage Users
        </Heading>
        <Text mb={6} fontSize="lg" color="gray.600">
          View and manage registered users.
        </Text>

        {users.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.500" mt={10}>
            No users found.
          </Text>
        ) : (
          <Box overflowX="auto"> {/* This makes the table itself horizontally scrollable */}
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user._id}>
                    <Td>{user.name || 'N/A'}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Tag
                        colorScheme={user.role === 'admin' ? 'purple' : 'primary'}
                        size="sm"
                      >
                        <Flex alignItems="center">{user.role}</Flex>
                      </Tag>
                    </Td>
                    <Td>
                      <Tag
                        colorScheme={user.active ? 'green' : 'red'}
                        size="sm"
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </Tag>
                    </Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {/* Mobile action buttons (stacked vertically) */}
                      <VStack
                        spacing={1}
                        align="stretch"
                        display={{ base: 'flex', md: 'none' }} // Show on mobile, hide on desktop
                      >
                        <Tooltip
                          label={
                            user.role === 'admin'
                              ? 'Admin status cannot be changed'
                              : ''
                          }
                          isDisabled={user.role !== 'admin'}
                        >
                          <IconButton
                            icon={user.active ? <FaUserShield /> : <FaUser />}
                            size="sm"
                            aria-label={
                              user.active ? 'Deactivate User' : 'Activate User'
                            }
                            colorScheme={user.active ? 'red' : 'green'}
                            variant="outline"
                            onClick={() =>
                              handleToggleActive(
                                user._id,
                                user.name || user.email,
                                user.active
                              )
                            }
                            w="100%" // Make button full width in VStack
                            isDisabled={
                              user.role === 'admin' ||
                              (currentUser && currentUser.id === user._id)
                            }
                          />
                        </Tooltip>
                      </VStack>

                      {/* Desktop action buttons (horizontal) */}
                      <HStack
                        spacing={2}
                        display={{ base: 'none', md: 'flex' }} // Hide on mobile, show on desktop
                      >
                        <Tooltip
                          label={
                            user.role === 'admin'
                              ? 'Admin status cannot be changed'
                              : ''
                          }
                          isDisabled={user.role !== 'admin'}
                        >
                          <IconButton
                            icon={user.active ? <FaUserShield /> : <FaUser />}
                            size="sm"
                            aria-label={
                              user.active ? 'Deactivate User' : 'Activate User'
                            }
                            colorScheme={user.active ? 'red' : 'green'}
                            variant="outline"
                            onClick={() =>
                              handleToggleActive(
                                user._id,
                                user.name || user.email,
                                user.active
                              )
                            }
                            isDisabled={
                              user.role === 'admin' ||
                              (currentUser && currentUser.id === user._id)
                            }
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deactivate User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to deactivate{' '}
              <Text as="span" fontWeight="bold">
                {selectedUser?.name || selectedUser?.email}
              </Text>
              ?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                No
              </Button>
              <Button colorScheme="red" onClick={confirmDeactivate} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AdminUsersPage;