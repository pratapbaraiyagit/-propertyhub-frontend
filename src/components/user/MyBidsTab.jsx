import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Spinner, VStack, useToast, Flex } from '@chakra-ui/react';
import axios from '../../api/axiosInstance';
import MyBidCard from './MyBidCard';

const MyBidsTab = () => {
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchActiveBids = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/profile/my-bids');
      setActiveBids(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching active bids.',
        description: error.response?.data?.message || 'Could not load your bids.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchActiveBids();
  }, [fetchActiveBids]);

  if (loading) return <Flex justify="center" p={10}><Spinner /></Flex>;

  return (
    <Box>
      {activeBids.length === 0 ? (
        <Text color="gray.500">You have no active bids in ongoing auctions.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {activeBids.map(auction => (
            <MyBidCard key={auction.propertyId} auction={auction} />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default MyBidsTab;