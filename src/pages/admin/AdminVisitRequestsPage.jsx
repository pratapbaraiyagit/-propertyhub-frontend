// frontend/src/pages/admin/AdminVisitRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  useToast,
  Tag,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  useColorModeValue,
  useBreakpointValue, // Import useBreakpointValue for more dynamic checks
} from '@chakra-ui/react';
import axios from '../../api/axiosInstance';
import { format } from 'date-fns';


// const ADMIN_API_URL = `/api/admin`;

const AdminVisitRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Determine if it's a mobile view for conditional rendering/styling
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  // --- Call ALL useColorModeValue hooks at the top level ---
  const modalMessageBgColor = useColorModeValue('gray.50', 'gray.800');
  const tableContainerBgColor = useColorModeValue("white", "gray.750");
  const tableRowHoverBgColor = useColorModeValue("gray.50", "gray.700");
  const selectBgColor = useColorModeValue("white", "gray.600");
  const noMessageTextColor = useColorModeValue("gray.500", "gray.400");

  const fetchVisitRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/admin/visit-requests`);
      setRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching visit requests:", err);
      const errMsg = err.response?.data?.message || err.message || "Could not load visit requests.";
      setError(errMsg);
      toast({
        title: 'Error fetching requests.',
        description: errMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVisitRequests();
  }, [fetchVisitRequests]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await axios.patch(`/admin/visit-requests/${requestId}`, { status: newStatus });
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );
      toast({
        title: 'Status Updated.',
        description: `Request status changed to ${newStatus}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      const errMsg = err.response?.data?.message || err.message || "Could not update status.";
      toast({
        title: 'Error Updating Status.',
        description: errMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewMessage = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    onOpen();
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedRequest) return;
    try {
      const response = await axios.patch(`/admin/visit-requests/${selectedRequest._id}`, { adminNotes });
      setRequests(prevRequests =>
        prevRequests.map(req => (req._id === selectedRequest._id ? response.data : req))
      );
      toast({
        title: 'Admin Notes Saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error("Error saving admin notes:", err);
      toast({
        title: 'Error Saving Notes.',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'green';
      case 'declined': return 'red';
      case 'completed': return 'blue';
      case 'cancelled_by_admin':
        return 'gray';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 150px)" p={{ base: 4, md: 8 }}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text ml={3} fontSize={{ base: 'md', md: 'lg' }}>Loading Visit Requests...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={{ base: 4, md: 8 }} maxW="container.xl" mx="auto">
        <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>
      </Box>
    );
  }

  // Filter requests if hideCompleted is true
  const visibleRequests = hideCompleted
    ? requests.filter(req => req.status?.toLowerCase() !== 'completed')
    : requests;

  return (
    <Box
      maxW="container.xl" // Constrain content width on very large screens
      px={{ base: 2, md: 6, lg: 8 }} // More granular horizontal padding
      py={{ base: 4, md: 8 }}     // Vertical padding
      mx="auto"                   // Center the content within the maxW
      minH="100vh"
  bg={tableRowHoverBgColor} // Subtle background
      overflowX="hidden"          // Prevent body scroll from table overflow
    >
      <Heading as="h1" size={headingSize} mb={6} textAlign={{ base: 'center', md: 'left' }}>
        Manage Visit Requests
      </Heading>
      <Button
        mb={4}
        colorScheme={hideCompleted ? 'primary' : 'gray'}
        variant={hideCompleted ? 'solid' : 'outline'}
        onClick={() => setHideCompleted(h => !h)}
        size={buttonSize}
      >
        {hideCompleted ? 'Show Complete Visits' : 'Hide Complete Visits'}
      </Button>

      {visibleRequests.length === 0 ? (
        <Flex justify="center" align="center" minH="200px" p={4} bg={tableContainerBgColor} borderRadius="md" shadow="base">
          <Text fontSize="lg" color="gray.600">No visit requests found.</Text>
        </Flex>
      ) : (
        <Box overflowX="auto" bg={tableContainerBgColor} p={4} borderRadius="md" shadow="base">
          {/*
            The Table component itself does not offer direct overflowX.
            Instead, wrap it in a Box and apply overflowX="auto" to the wrapper.
            minW ensures the table columns don't collapse too much on small screens,
            triggering the horizontal scrollbar.
          */}
          <Table variant="simple" size={tableSize} minW="900px"> {/* Added minW for better control */}
            <Thead>
              <Tr>
                {/* Adjust font size and padding for table headers */}
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Property</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>User</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }} display={{ base: 'none', lg: 'table-cell' }}>Contact</Th> {/* Hide on small/medium, show on large */}
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Preferred Date</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }} display={{ base: 'none', sm: 'table-cell' }}>Preferred Time</Th> {/* Hide on smallest, show on small+ */}
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Status</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }} display={{ base: 'none', md: 'table-cell' }}>Submitted</Th> {/* Hide on small, show on medium+ */}
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {visibleRequests.map((req) => (
                <Tr key={req._id} _hover={{ bg: tableRowHoverBgColor }}>
                  <Td maxW={{ base: '120px', md: '200px' }} whiteSpace="normal" wordBreak="break-word" fontSize={{ base: 'sm', md: 'md' }}>
                    <Text fontWeight="medium">{req.propertyId?.title || 'N/A'}</Text>
                    <Text fontSize="xs" color="gray.500">{req.propertyId?.address || req.propertyId?._id}</Text>
                  </Td>
                  <Td maxW={{ base: '100px', md: '150px' }} whiteSpace="normal" wordBreak="break-word" fontSize={{ base: 'sm', md: 'md' }}>
                    <Text>{req.userName || 'N/A'}</Text>
                    <Text fontSize="xs" color="gray.500">{req.userEmail}</Text>
                  </Td>
                  <Td display={{ base: 'none', lg: 'table-cell' }} fontSize={{ base: 'sm', md: 'md' }}>{req.contactNumber}</Td>
                  <Td fontSize={{ base: 'sm', md: 'md' }}>{req.preferredDate ? format(new Date(req.preferredDate), 'MMM d, yyyy') : 'N/A'}</Td>
                  <Td display={{ base: 'none', sm: 'table-cell' }} fontSize={{ base: 'sm', md: 'md' }}>{req.preferredTime}</Td>
                  <Td>
                    <Select
                      size="sm"
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      borderColor={`${getStatusColor(req.status)}.300`}
                      focusBorderColor={`${getStatusColor(req.status)}.500`}
                      bg={selectBgColor}
                      // Make Select full width of Td on mobile
                      w={{ base: '100%', md: 'auto' }}
                      maxW={{ base: '120px', md: 'none'}} // Limit width on desktop if preferred
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled_by_admin">Cancelled (Admin)</option>
                    </Select>
                  </Td>
                  <Td display={{ base: 'none', md: 'table-cell' }} fontSize={{ base: 'sm', md: 'md' }}>{req.createdAt ? format(new Date(req.createdAt), 'MMM d, hh:mm a') : 'N/A'}</Td>
                  <Td>
                    <Button size={buttonSize} type="button" onClick={() => handleViewMessage(req)} variant="outline" colorScheme="blue" w="100%">
                      Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal for Viewing Message and Adding/Editing Admin Notes */}
      {selectedRequest && (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }} isCentered> {/* Full screen on mobile */}
          <ModalOverlay />
          <ModalContent borderRadius={{ base: 'none', md: 'md' }} h={{ base: '100vh', md: 'auto' }}> {/* No border radius on mobile full screen, adjust height */}
            <ModalHeader>{isMobile ? "Request Details" : "Visit Request Details"}</ModalHeader> {/* Shorter title for mobile */}
            <ModalCloseButton />
            <ModalBody pb={6} overflowY="auto"> {/* Enable scrolling for modal body */}
              <VStack align="start" spacing={5}>
                <Box>
                  <Text fontWeight="bold">Property:</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}>{selectedRequest.propertyId?.title || 'N/A'} ({selectedRequest.propertyId?.address})</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">User:</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}>{selectedRequest.userName} ({selectedRequest.userEmail})</Text>
                </Box>
                 <Box>
                  <Text fontWeight="bold">Contact:</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}>{selectedRequest.contactNumber}</Text>
                </Box>
                 <Box>
                  <Text fontWeight="bold">Preferred Date & Time:</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}>
                    {selectedRequest.preferredDate ? format(new Date(selectedRequest.preferredDate), 'MMMM d, yyyy') : 'N/A'}
                    {' at '}{selectedRequest.preferredTime}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontWeight="bold">User's Message/Questions:</Text>
                  <Box
                    whiteSpace="pre-wrap"
                    p={3}
                    borderWidth="1px"
                    rounded="md"
                    minH="80px"
                    bg={modalMessageBgColor}
                    mt={1}
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    {selectedRequest.message || <Text as="em" color={noMessageTextColor}>No message provided.</Text>}
                  </Box>
                </Box>
                <FormControl mt={2}>
                  <FormLabel htmlFor="adminNotes">Admin Notes:</FormLabel>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                    fontSize={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose} mr={3} size={buttonSize}>Close</Button>
              <Button colorScheme="primary" onClick={handleSaveAdminNotes} size={buttonSize}>Save Notes</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AdminVisitRequestsPage;