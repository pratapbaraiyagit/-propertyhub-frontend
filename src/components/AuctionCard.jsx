// src/components/AuctionCard.jsx - CORRECTED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Image, Heading, Text, Flex, Button, Tag, Icon, VStack, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { formatToLKR } from '../../utils/formatting'; // Assuming you have a currency formatter

// A more intelligent CountdownTimer that is status-aware
const CountdownTimer = ({ startTime, endTime, status }) => {
    // 1. Wrap getTargetTime in useCallback so it's a stable dependency.
    //    It only gets recreated if status, startTime, or endTime changes.
    const getTargetTime = useCallback(() => {
        if (status === 'Upcoming') return startTime;
        if (status === 'Live') return endTime;
        return null; // No target time for Ended, Cancelled, etc.
    }, [status, startTime, endTime]);

    const calculateTimeLeft = useCallback(() => {
        const targetTime = getTargetTime();
        if (!targetTime) return {};

        const difference = +new Date(targetTime) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                D: Math.floor(difference / (1000 * 60 * 60 * 24)),
                H: Math.floor((difference / (1000 * 60 * 60)) % 24),
                M: Math.floor((difference / 1000 / 60) % 60),
                S: Math.floor((difference / 1000) % 60),
            };
        }
       return timeLeft;
    }, [getTargetTime]); 

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, calculateTimeLeft]);

    if (status === 'Ended' || status === 'Cancelled') {
        return <Text fontWeight="bold" color="red.500">Auction Ended</Text>;
    }
    
    if (status === 'Paused') {
        return <Text fontWeight="bold" color="orange.500">Auction Paused</Text>;
    }

    const timerComponents = Object.entries(timeLeft)
        .filter(([unit, value]) => value > 0 || (unit === 'D' && Object.keys(timeLeft).length > 1) || Object.keys(timeLeft).length === 1)
        .map(([unit, value]) => (
            <Box key={unit} textAlign="center">
                <Text fontSize="lg" fontWeight="bold">{String(value).padStart(2, '0')}</Text>
                <Text fontSize="xs" textTransform="uppercase">{unit}</Text>
            </Box>
        ));

    const prefixText = status === 'Upcoming' ? 'Starts In:' : 'Ends In:';

    return timerComponents.length ? (
        <Flex gap={3} align="center">
            <Text fontSize="sm" color="gray.600">{prefixText}</Text>
            {timerComponents}
        </Flex>
    ) : <Text>Processing...</Text>;
};

const AuctionCard = ({ property }) => {
    const { auction } = property;
    const cardBg = useColorModeValue('white', 'gray.800');

    if (!auction) return null;

    const getStatusColorScheme = (status) => {
        switch (status) {
          case 'Live': return 'green';
          case 'Upcoming': return 'blue';
          case 'Ended': return 'red';
          default: return 'gray';
        }
    };
    
    const isBiddingActive = auction.status === 'Live';

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            transition="all 0.2s"
            _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)' }}
        >
            <Image 
  src={property.imageUrls?.[0] || 'https://via.placeholder.com/400x300.png?text=No+Image'} 
  alt={property.title} 
  h="200px" 
  w="100%" 
  objectFit="cover" 
/>
            
            <VStack p={5} align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                    <Heading size="md" noOfLines={1} pr={2}>{property.title}</Heading>
                    <Tag size="sm" colorScheme={getStatusColorScheme(auction.status)} whiteSpace="nowrap">
                        {auction.status}
                    </Tag>
                </Flex>

                <Flex align="center" color="gray.500" fontSize="sm">
                    <Icon as={FaMapMarkerAlt} mr={2} />
                    <Text noOfLines={1}>{property.location}</Text>
                </Flex>

                <Flex justify="space-between" align="baseline">
                    <Text fontSize="sm" color="gray.600">{isBiddingActive ? 'Current Bid' : 'Starting Price'}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                        {formatToLKR(auction.currentBid)}
                    </Text>
                </Flex>

                <Flex justify="center" align="center" p={2} bg="gray.50" borderRadius="md">
                    <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} status={auction.status} />
                </Flex>

                <Button
                    as={RouterLink}
                    to={`/auctions/${property._id}`}
                    colorScheme="orange"
                    w="100%"
                    // Disable the button if the auction is not live
                    isDisabled={!isBiddingActive}
                >
                    {isBiddingActive ? 'Place Bid' : 'View Auction'}
                </Button>
            </VStack>
        </Box>
    );
};

export default AuctionCard;