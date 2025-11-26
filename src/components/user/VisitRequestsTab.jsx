import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Spinner,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  HStack,
  Text,
  Tag,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FaCalendarCheck, FaHome } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { format } from 'date-fns';

const VisitRequestsTab = () => {
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const sectionTitleColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/profile/my-visit-requests');
        setVisitRequests(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Could not load your visit requests.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this visit request?')) return;
    try {
      await axios.patch(`/visit-requests/${requestId}/cancel`);
      toast({
        title: 'Request Cancelled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh the list
      setVisitRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'cancelled' } : req
        )
      );
    } catch (err) {
      toast({
        title: 'Cancellation Failed',
        description: err.response?.data?.message || 'Could not cancel the request.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'green';
      case 'declined':
        return 'red';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg={cardBg} boxShadow="md" borderRadius="lg" w="full">
      <HStack mb={6} spacing={3} color={sectionTitleColor}>
        <Icon as={FaCalendarCheck} w={6} h={6} color="primary.400" />
        <Heading as="h2" size="md" fontWeight="bold">
          Requested Visits
        </Heading>
      </HStack>
      {loading ? (
        <Flex justify="center" align="center" minH="150px">
          <Spinner color="primary.400" size="lg" />
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Oops!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : visitRequests.length === 0 ? (
        <Flex direction="column" align="center" justify="center" minH="150px" textAlign="center" p={4}>
          <Text color="gray.400" fontSize="lg" fontStyle="italic">
            You haven't requested any visits yet.
          </Text>
          <Icon as={FaHome} w={10} h={10} color="gray.300" mt={2} />
        </Flex>
      ) : (
        <VStack spacing={4} align="stretch">
          {visitRequests.map((visit) => (
            <Box key={visit._id} p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
              <HStack justify="space-between">
                <Box>
                  <Text
                    fontWeight="bold"
                    as={RouterLink}
                    to={`/properties/${visit.propertyId?._id}`}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {visit.propertyId?.title || 'Property Not Found'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Requested for: {format(new Date(visit.preferredDate), 'MMMM d, yyyy')} at {visit.preferredTime}
                  </Text>
                </Box>
                <Tag colorScheme={getStatusColor(visit.status)}>{visit.status}</Tag>
              </HStack>
              {visit.status === 'pending' && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  mt={3}
                  onClick={() => handleCancelRequest(visit._id)}
                >
                  Cancel Request
                </Button>
              )}
            </Box>
          ))}
        </VStack>
      )}
      </Box>
  );
};

export default VisitRequestsTab;