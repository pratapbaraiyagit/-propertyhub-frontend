// src/components/PropertyCard.jsx
import React, { useState } from "react";
import useAuctionSocket from '../hooks/useAuctionSocket';
import CountdownTimer from './CountdownTimer';
import AuctionPopup from './AuctionPopup';
import { 
  Box, Heading, Text, Image, Button, Badge, Stack, Icon, 
  Flex, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, Input, VStack, useDisclosure, useColorModeValue, useToast 
} from '@chakra-ui/react';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaHeart, FaRegHeart, FaCalendarAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useCompare } from '../context/compareContext';
import VisitRequestForm from '../pages/VisitRequestForm';
import { useNavigate } from 'react-router-dom';

import axios from '../api/axiosInstance';
import { formatToLKR } from '../utils/formatting';

import { useAuth } from '../context/AuthContext';

const PropertyCard = ({ property }) => {
  // Bid modal state
  const [isBidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  // Handler to open bid modal from AuctionPopup
  const handleOpenBidModal = () => {
    setBidModalOpen(true);
  };

  // Handler for bid submission
  const handleBidSubmit = async () => {
    const currentBid = liveAuction?.currentBid || 0;
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'You must be logged in to place a bid.', status: 'warning', isClosable: true });
      return;
    }
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= currentBid) {
      toast({ title: 'Invalid Bid', description: `Your bid must be a number higher than the current bid.`, status: 'error', isClosable: true });
      return;
    }
    setIsBidding(true);
    try {
      await axios.post(`/auctions/${property._id}/bids`, { amount: Number(bidAmount) });
      toast({ title: 'Bid Placed!', status: 'success', isClosable: true });
      setBidAmount('');
      setBidModalOpen(false);
    } catch (err) {
      toast({ title: 'Bid Failed', description: err.response?.data?.message || 'Could not place bid.', status: 'error', isClosable: true });
    } finally {
      setIsBidding(false);
    }
  };
  // Move all hooks to the top before any return
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const priceColor = useColorModeValue('primary.600', 'primary.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');

  const { isOpen: isVisitModalOpen, onOpen: openVisitModal, onClose: closeVisitModal } = useDisclosure();
  const { addToCompare, isPropertyInCompare, compareList } = useCompare();
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  

  // Auction popup state
  const [isAuctionOpen, setAuctionOpen] = useState(false);
  // Real-time auction state
  const [liveAuction, setLiveAuction] = useState(property.auction);

  // Listen for real-time auction updates
  useAuctionSocket((data) => {
    if (property.auction && data.propertyId === property._id) {
      setLiveAuction((prev) => ({
        ...prev,
        status: data.status,
        currentBid: data.currentBid,
      }));
    }
  });

  if (!property) {
    return null;
  }

  const isCompared = isPropertyInCompare(property._id);
  const isCompareFull = compareList.length >= 2;

  const handleAddToCompare = () => {
    const result = addToCompare(property._id);
    if (result === 'added_second') {
      navigate('/compare');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const isAuctionLive = liveAuction && liveAuction.status === 'Live';
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.3s cubic-bezier(.25,.8,.25,1)"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        bg: hoverBg,
      }}
      position="relative"
    >

      {/* Auction Banner - prominent and mobile friendly */}
      {isAuctionLive && (
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align="center"
          justify="space-between"
          bgGradient="linear(to-r, primary.400, primary.500, primary.600)"
          color="white"
          px={{ base: 3, sm: 5 }}
          py={{ base: 2, sm: 2 }}
          borderTopRadius="xl"
          position="relative"
          zIndex={2}
        >
          <Flex align="center" gap={2} mb={{ base: 1, sm: 0 }}>
            <Icon as={FaCalendarAlt} boxSize={{ base: 5, sm: 6 }} />
            <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg' }} letterSpacing="wide">
              LIVE AUCTION
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="semibold">
              Ends in:
            </Text>
            <Box
              px={3}
              py={1}
              bg="whiteAlpha.800"
              color="primary.700"
              borderRadius="md"
              fontWeight="bold"
              fontSize={{ base: 'md', sm: 'lg' }}
              minW={{ base: '90px', sm: '120px' }}
              textAlign="center"
              boxShadow="md"
            >
              <CountdownTimer endTime={liveAuction.endTime} />
            </Box>
          </Flex>
        </Flex>
      )}
    
      {/* Favorite button */}
      <Button 
        position="absolute"
        top={2}
        right={2}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={toggleFavorite}
        zIndex="1"
      >
        <Icon as={isFavorite ? FaHeart : FaRegHeart} color={isFavorite ? 'red.500' : 'gray.400'} />
      </Button>

      {/* Image with gradient overlay */}
      <Box position="relative">
        {property.imageUrls && property.imageUrls[0] ? (
          <Image
            src={property.imageUrls[0]}
            alt={`View of ${property.title}`}
            height="220px"
            width="100%"
            objectFit="cover"
            loading="lazy"
          />
        ) : (
          <Box 
            height="220px" 
            width="100%" 
            bgGradient="linear(to-br, gray.200, gray.300)"
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Text color="gray.500">No Image Available</Text>
          </Box>
        )}
        <Box 
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="50%"
          bgGradient="linear(to-t, rgba(0,0,0,0.7), transparent)"
        />
      </Box>

      <Box p={5}>
        {/* Price ribbon */}
        <Box 
          position="absolute"
          top="180px"
          left="4"
          bg={priceColor}
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontWeight="bold"
          fontSize="lg"
          boxShadow="md"
        >
          {property.price ? `LKR ${property.price.toLocaleString()} M` : 'N/A'}
        </Box>

        {/* Location */}
        <Flex align="center" mb={2}>
          <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
          <Text fontSize="sm" color="gray.600" noOfLines={1}>
            {property.location || 'Location not specified'}
          </Text>
        </Flex>

        {/* Title */}
        <Heading 
          as="h3" 
          size="md" 
          fontWeight="bold" 
          noOfLines={1} 
          mb={2}
          color={headingColor}
        >
          {property.title || 'Untitled Property'}
        </Heading>

        {/* Badges */}
        <Stack direction="row" mb={3} spacing={2}>
          <Badge 
            borderRadius="full" 
            px={3} 
            py={1} 
            colorScheme="secondary"
            variant="subtle"
          >
            {property.propertyType || 'N/A'}
          </Badge>
          {property.status && (
            <Badge 
              borderRadius="full" 
              px={3} 
              py={1}
              colorScheme={property.status === 'for sale' ? 'green' : 'orange'}
              variant="subtle"
            >
              {property.status}
            </Badge>
          )}
        </Stack>

        {/* Features */}
        <Stack 
          direction="row" 
          spacing={4} 
          color="gray.600" 
          fontSize="sm" 
          mb={4}
          divider={<Box borderLeft="1px" borderColor="gray.300" height="16px" alignSelf="center" />}
        >
          {property.bedrooms !== undefined && (
            <Flex alignItems="center">
              <Icon as={FaBed} mr={1} /> 
              <Text fontWeight="medium">{property.bedrooms}</Text>
            </Flex>
          )}
          {property.bathrooms !== undefined && (
            <Flex alignItems="center">
              <Icon as={FaBath} mr={1} /> 
              <Text fontWeight="medium">{property.bathrooms}</Text>
            </Flex>
          )}
          {property.area !== undefined && (
            <Flex alignItems="center">
              <Icon as={FaRulerCombined} mr={1} /> 
              <Text fontWeight="medium">{property.area} ft²</Text>
            </Flex>
          )}
        </Stack>

        {/* Buttons */}
        <Stack direction="row" spacing={3} mt={4}>
          <Button
            as={RouterLink}
            to={`/properties/${property._id}`}
            colorScheme="secondary"
            size="sm"
            flex={1}
            variant="outline"
            _hover={{
              bg: 'primary.600',
              color: 'white'
            }}
          >
            View Details
          </Button>
          <Button
            colorScheme={isCompared ? 'gray' : 'primary'}
            variant={isCompared ? 'outline' : 'solid'}
            onClick={handleAddToCompare}
            isDisabled={isCompared || isCompareFull}
            size="sm"
            flex={1}
          >
            {isCompared ? 'Added' : isCompareFull ? 'Full' : 'Compare'}
          </Button>
        </Stack>

        {/* Secondary actions */}
        <Flex mt={3} justify="space-between">
          <Button
            onClick={openVisitModal}
            colorScheme="primary"
            size="xs"
            variant="ghost"
            leftIcon={<Icon as={FaCalendarAlt} />}
          >
            Visit
          </Button>
          {isAuctionLive && (
            <Button 
              colorScheme="orange" 
              size="xs" 
              variant="solid"
              onClick={() => setAuctionOpen(true)}
            >
              Auction / Bid
            </Button>
          )}
        </Flex>
      </Box>

      {/* Visit Request Modal */}
      <Modal isOpen={isVisitModalOpen} onClose={closeVisitModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px">Schedule a Visit</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VisitRequestForm 
              propertyId={property._id} 
              propertyTitle={property.title} 
              onFormSubmitSuccess={closeVisitModal} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Auction Popup Modal */}
      {isAuctionLive && (
        <>
          <AuctionPopup
            isOpen={isAuctionOpen}
            onClose={() => setAuctionOpen(false)}
            auction={{
              ...liveAuction,
              propertyTitle: property.title,
            }}
            onBid={handleOpenBidModal}
          />
          {/* Bid Modal */}
          <Modal isOpen={isBidModalOpen} onClose={() => setBidModalOpen(false)} isCentered>
            <ModalOverlay />
            <ModalContent mx={4}>
              <ModalHeader>Place a Bid</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Text><strong>Status:</strong> <span>{liveAuction.status}</span></Text>
                  <Text><strong>Current Bid:</strong> <span style={{ color: 'orange' }}>{formatToLKR(liveAuction.currentBid)}</span></Text>
                  <Text fontSize="sm"><strong>Start Time:</strong> {new Date(liveAuction.startTime).toLocaleString()}</Text>
                  <Text fontSize="sm"><strong>End Time:</strong> {new Date(liveAuction.endTime).toLocaleString()}</Text>
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Enter amount > ${liveAuction.currentBid?.toLocaleString()}`}
                  />
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setBidModalOpen(false)}>Close</Button>
                <Button colorScheme="primary" onClick={handleBidSubmit} isLoading={isBidding}>Place Bid</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default PropertyCard;
