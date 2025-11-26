// AuctionDetailsPage.jsx (Completely new version)

import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Box, Heading, Text, Tag, Spinner, Flex, Button, Input, VStack, Table, Thead, Tbody, Tr, Th, Td, useToast,
  SimpleGrid, Image, Container, Divider, Icon, AspectRatio
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext'; // To check if user is logged in

const CountdownTimer = ({ endTime, onEnd, status }) => {
    // ... same CountdownTimer component from AuctionCard.jsx ...
    // Add onEnd and status props
    const calculateTimeLeft = useCallback(() => {
        if (status !== 'Live') return {};
        const difference = +new Date(endTime) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = { d: Math.floor(difference / (1000 * 60 * 60 * 24)), h: Math.floor((difference / (1000 * 60 * 60)) % 24), m: Math.floor((difference / 1000 / 60) % 60), s: Math.floor((difference / 1000) % 60) };
        }
        return timeLeft;
    }, [endTime, status]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (status !== 'Live') {
            setTimeLeft({});
            return;
        }
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (!Object.keys(newTimeLeft).length) {
                onEnd();
            }
        }, 1000);
        return () => clearTimeout(timer);
    });

    if (status === 'Upcoming') return <Text>Auction has not started.</Text>;
    if (status === 'Ended' || status === 'Cancelled') return <Text>Auction has ended.</Text>;
    
    return Object.keys(timeLeft).length ? (
        <Flex gap={3} align="baseline">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <Flex key={unit} direction="column" align="center">
                    <Text fontSize="2xl" fontWeight="bold">{String(value).padStart(2, '0')}</Text>
                    <Text fontSize="xs" textTransform="uppercase">{unit}</Text>
                </Flex>
            ))}
        </Flex>
    ) : <Text>Processing...</Text>;
};

const AuctionDetailsPage = () => {
  const { propertyId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const toast = useToast();
  const [setError] = useState(null);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/properties/${propertyId}`);
      setProperty(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load property details.');
      toast({ title: "Error", description: "Could not load auction details.", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [propertyId, toast]);

  useEffect(() => {
    fetchAuctionDetails();
    // In a real app, you would set up WebSocket listeners here.
    // For now, we'll poll every 10 seconds.
    const interval = setInterval(fetchAuctionDetails, 10000);
    return () => clearInterval(interval);
  }, [fetchAuctionDetails]);

  const handleBid = async () => {
    if (!user) {
        toast({ title: 'Login Required', description: 'You must be logged in to place a bid.', status: 'warning' });
        navigate('/login');
        return;
    }
    const minBid = property.auction.currentBid + (property.auction.bidIncrement || 1);
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) < minBid) {
      toast({ title: 'Invalid Bid', description: `Your bid must be at least $${minBid.toLocaleString()}`, status: 'error' });
      return;
    }
    setIsBidding(true);
    try {
      await axios.post(`/auctions/${property._id}/bids`, { amount: Number(bidAmount) });
      toast({ title: 'Bid Placed!', description: 'You are the new highest bidder.', status: 'success' });
      setBidAmount('');
      fetchAuctionDetails(); // Re-fetch immediately after bidding
    } catch (error) {
      toast({ title: 'Bid Failed', description: error.response?.data?.message || 'Could not place bid.', status: 'error' });
    } finally {
      setIsBidding(false);
    }
  };
  
  if (loading || authLoading) return <Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>;
  if (!property || !property.auction) return <Text>Auction not found.</Text>;
  
  const { auction } = property;
  const isAuctionLive = auction.status === 'Live';

    console.log({
    message: "Debugging AuctionDetailsPage data",
    isAuctionLive: isAuctionLive,
    auctionStatus: auction.status,
    userObject: user,
    isUserNull: !user,
    isBidding: isBidding
  });

  const highestBidder = auction.bids.length > 0 ? auction.bids[auction.bids.length - 1].user : null;
  const isUserHighestBidder = user && highestBidder === user._id;

  return (
    <Container maxW="container.xl" py={8}>
        <Heading size="xl" mb={2}>{property.title}</Heading>
        <Flex align="center" color="gray.500" fontSize="lg" mb={6}>
            <Icon as={FaMapMarkerAlt} mr={2} />
            <Text>{property.location}</Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Left Column: Auction Panel & Property Images */}
            <VStack spacing={6} align="stretch">
                <Box p={6} bg="white" borderRadius="lg" boxShadow="lg" borderTop="4px" borderColor="orange.400">
                    <Heading size="lg" mb={4}>Auction Status</Heading>
                    <Flex justify="center" mb={4}>
                        <CountdownTimer endTime={auction.endTime} status={auction.status} onEnd={fetchAuctionDetails} />
                    </Flex>
                    <VStack spacing={3} divider={<Divider />}>
                        <Flex w="100%" justify="space-between">
                            <Text>Current Bid:</Text>
                            <Text fontSize="2xl" fontWeight="bold">${auction.currentBid.toLocaleString()}</Text>
                        </Flex>
                        <Flex w="100%" justify="space-between">
                            <Text>Number of Bids:</Text>
                            <Text fontWeight="bold">{auction.bids.length}</Text>
                        </Flex>
                        <Flex w="100%" justify="space-between">
                            <Text>Status:</Text>
                            <Tag colorScheme={auction.status === 'Live' ? 'green' : 'red'}>{auction.status}</Tag>
                        </Flex>
                    </VStack>

                    {isAuctionLive && (
        <VStack mt={6} spacing={3}>
            <Input
                                type="number"
                                placeholder={`Enter bid > $${auction.currentBid.toLocaleString()}`}
                                size="lg"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                isDisabled={isBidding}
                            />
                            <Button
                                colorScheme="orange"
                                size="lg"
                                w="100%"
                                onClick={handleBid}
                                isLoading={isBidding}
                                isDisabled={!isAuctionLive || !user || isBidding}
                                //isDisabled={isBidding}
                            >
                                Place Your Bid
                            </Button>
                            {isUserHighestBidder && <Text color="green.500">You are the highest bidder!</Text>}
                        {!user && isAuctionLive && (
              <Text fontSize="sm" color="red.500">You must be logged in to place a bid.</Text>
            )}
                        </VStack>
                    )}
                </Box>
                <AspectRatio ratio={16 / 9}><Image src={property.imageUrls[0]} borderRadius="md" /></AspectRatio>
            </VStack>

            {/* Right Column: Property Details & Bid History */}
            <VStack spacing={6} align="stretch">
                <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                    <Heading size="md" mb={4}>Property Details</Heading>
                     {/* Simplified Property Details... */}
                </Box>
                <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                    <Heading size="md" mb={4}>Bid History</Heading>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr><Th>Bidder</Th><Th isNumeric>Amount</Th><Th>Time</Th></Tr>
                        </Thead>
                        <Tbody>
                        {[...auction.bids].reverse().map((b) => (
                          <Tr key={b._id} bg={b.user === user?._id ? 'green.50' : 'transparent'}>
                            <Td>{b.user === user?._id ? 'Your Bid' : `User #${b.user.slice(-4)}`}</Td>
                            <Td isNumeric>${b.amount.toLocaleString()}</Td>
                            <Td>{new Date(b.timestamp).toLocaleTimeString()}</Td>
                          </Tr>
                        ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </SimpleGrid>
    </Container>
  );
};

export default AuctionDetailsPage;