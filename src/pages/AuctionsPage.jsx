import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Spinner, SimpleGrid, Flex, Alert } from '@chakra-ui/react';
import axios from '../api/axiosInstance';
import PropertyCard from '../components/PropertyCard';


const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed unused state and hooks after switching to PropertyCard

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/auctions');
      setAuctions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch auctions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Removed unused modal/bid logic after switching to PropertyCard


  if (loading) return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
  if (error) return <Box p={6}><Alert status="error">{error}</Alert></Box>;

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="xl" mb={8} textAlign="center">
        Live & Upcoming Auctions
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }}>
        {auctions.map(property => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </SimpleGrid>

      {/* Bid Modal removed: PropertyCard handles auction/bid modals */}
    </Box>
  );
};


export default AuctionsPage;