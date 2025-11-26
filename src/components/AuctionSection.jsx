// CORRECTED VERSION of AuctionSection.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Flex, Tag, Button, Input, useToast, Heading, VStack } from '@chakra-ui/react';
import axios from '../api/axiosInstance';
import { io } from 'socket.io-client';
import { formatToLKR } from '../../utils/formatting'; // Assuming you have this

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const AuctionSection = ({ property, user, refreshProperty }) => {
    // Destructure auction from property for cleaner access
    const { auction } = property;
    const toast = useToast();
    
    // State for user input
    const [bidAmount, setBidAmount] = useState('');
    const [isBidding, setIsBidding] = useState(false);
    
    // State for the countdown display text
    const [countdown, setCountdown] = useState('');
    
    const intervalRef = useRef();
    const socketRef = useRef();

    // More robust timer logic that is status-aware
    const updateCountdown = useCallback(() => {
        if (!auction || !auction.status) return;

        let targetTime, prefix;
        if (auction.status === 'Upcoming') {
            targetTime = new Date(auction.startTime);
            prefix = 'Starts in:';
        } else if (auction.status === 'Live') {
            targetTime = new Date(auction.endTime);
            prefix = 'Ends in:';
        } else {
            // For 'Ended', 'Cancelled', etc., clear the interval and set a final message.
            clearInterval(intervalRef.current);
            setCountdown(`Auction ${auction.status}`);
            return;
        }

        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
            // When the countdown hits zero, refresh the property to get the new status from the server.
            refreshProperty();
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        let countdownString = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        if (d > 0) {
            countdownString = `${d}d ` + countdownString;
        }
        
        setCountdown(`${prefix} ${countdownString}`);

    }, [auction, refreshProperty]);

    useEffect(() => {
        updateCountdown(); // Run once immediately
        intervalRef.current = setInterval(updateCountdown, 1000);
        return () => clearInterval(intervalRef.current);
    }, [updateCountdown]);


    // Socket.io connection (no changes needed here, it was correct)
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
        
        const onUpdate = (data) => {
            if (data.propertyId === property._id) {
                refreshProperty && refreshProperty();
            }
        };

        socketRef.current.on('bidUpdate', onUpdate);
        socketRef.current.on('statusUpdate', onUpdate); // Assuming a 'statusUpdate' event

        return () => {
            socketRef.current.disconnect();
        };
    }, [property._id, refreshProperty]);


    const handleBid = async () => {
        // CORRECTED: Access auction data from the 'auction' object
        if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= auction.currentBid) {
            toast({
                title: 'Invalid Bid',
                description: `Your bid must be higher than the current bid of ${formatToLKR(auction.currentBid)}.`,
                status: 'error',
            });
            return;
        }
        setIsBidding(true);
        try {
            await axios.post(`/api/auctions/${property._id}/bids`, { amount: Number(bidAmount) });
            toast({ title: 'Bid Placed!', status: 'success' });
            setBidAmount('');
            // The socket event will trigger the refresh, so a manual call isn't strictly necessary but is good for immediate feedback.
            refreshProperty && refreshProperty();
        } catch (err) {
            toast({ title: 'Bid Failed', description: err.response?.data?.message, status: 'error' });
        } finally {
            setIsBidding(false);
        }
    };
    
    // If there is no auction object, render nothing.
    if (!auction) return null;

    // A clear boolean to control UI elements
    const isBiddingActive = auction.status === 'Live';

    const getStatusColorScheme = (status) => {
        return status === 'Live' ? 'green' : status === 'Upcoming' ? 'blue' : 'red';
    };

    return (
        <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" mb={6} boxShadow="base">
            <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={4}>
                <Tag colorScheme={getStatusColorScheme(auction.status)} size="lg">{auction.status}</Tag>
                <Box textAlign="right">
                    <Text fontSize="sm" color="gray.500">{isBiddingActive ? 'Current Bid' : 'Starting Price'}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="primary.600">{formatToLKR(auction.currentBid)}</Text>
                </Box>
                <Text fontSize="lg" fontWeight="medium" color="gray.700" minW="220px" textAlign="right">{countdown}</Text>
            </Flex>

            {/* Only show the bidding form if the auction is Live */}
            {isBiddingActive && (
                <VStack align="start" spacing={3} pt={4} borderTopWidth="1px">
                    <Heading size="sm">Place Your Bid</Heading>
                    <Flex gap={2} align="center" w="100%">
                        <Input
                            type="number"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            // CORRECTED: Use auction.currentBid in the placeholder
                            placeholder={`> ${formatToLKR(auction.currentBid)}`}
                            isDisabled={isBidding}
                            flex="1"
                        />
                        <Button
                            colorScheme="orange"
                            onClick={handleBid}
                            isLoading={isBidding}
                            // Also disable if the user is not logged in
                            isDisabled={isBidding || !user}
                        >
                            Place Bid
                        </Button>
                    </Flex>
                    {!user && <Text fontSize="sm" color="red.500">Please log in to place a bid.</Text>}
                </VStack>
            )}
        </Box>
    );
};

export default AuctionSection;