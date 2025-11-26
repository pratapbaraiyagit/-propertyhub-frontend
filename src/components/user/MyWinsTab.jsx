// frontend/src/components/user/MyWinsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Spinner, VStack, HStack, Tag, Button, useToast, useColorModeValue, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { formatToLKR } from '../../utils/formatting';

const MyWinsTab = () => {
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const itemBg = useColorModeValue('gray.50', 'gray.800');

  const fetchWonAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/profile/my-wins');
      // Log the API response to the console for debugging
      console.log('API response for /profile/my-wins:', response.data);
      setWonAuctions(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching won auctions.',
        description: error.response?.data?.message || 'Could not load your wins.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWonAuctions();
  }, [fetchWonAuctions]);

  if (loading) return <Flex justify="center" p={10}><Spinner /></Flex>;

  return (
    <Box>
      {wonAuctions.length === 0 ? (
        <Text color="gray.500">You have not won any auctions yet.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {wonAuctions.map(prop => (
            <Box key={prop._id} p={4} borderWidth="1px" borderRadius="md" bg={itemBg}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="bold">{prop.title}</Text>
                  {/* Safely access the currentBid to avoid errors */}
                  <Text fontSize="sm" color="gray.500">Winning Bid: {formatToLKR(prop.auction?.currentBid || 0)}</Text>
                </Box>
                <Tag colorScheme="blue">Won</Tag>
              </HStack>
              <Button as={RouterLink} to={`/properties/${prop._id}`} size="sm" variant="outline" mt={3}>
                View Property Details
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default MyWinsTab;