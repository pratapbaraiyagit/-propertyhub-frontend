import React, { useState, useEffect } from "react";
import useAuctionSocket from '../hooks/useAuctionSocket';
import CountdownTimer from '../components/CountdownTimer';
import AuctionPopup from '../components/AuctionPopup';
import axios from '../api/axiosInstance';
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Heading,
  Text,
  SimpleGrid,
  Tag,
  Spinner,
  Alert,
  AlertIcon,
  Container,
  Flex,
  Stack,
  AspectRatio,
  Icon,
  Divider,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { useCompare } from '../context/CompareContext';
import VisitRequestForm from './VisitRequestForm';
import { buttonProps } from '../theme/ui';

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  const { addToCompare, isPropertyInCompare, compareList } = useCompare();
  const isCompared = property && isPropertyInCompare(property._id);
  const isCompareFull = compareList && compareList.length >= 2;
  const [isVisitModalOpen, setVisitModalOpen] = useState(false);
  const [isAuctionOpen, setAuctionOpen] = useState(false);
  // Real-time auction state
  const [liveAuction, setLiveAuction] = useState(null);

  // Listen for real-time auction updates
  useAuctionSocket((data) => {
    if (property && property.auction && data.propertyId === property._id) {
      setLiveAuction((prev) => ({
        ...property.auction,
        ...prev,
        status: data.status,
        currentBid: data.currentBid,
      }));
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) {
        setError("No property ID provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`/properties/${propertyId}`);
        setProperty(response.data);
        setLiveAuction(response.data.auction || null);
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        setError(err.message || "Could not load property details.");
        toast({
          title: "Error",
          description: err.message || "Could not load property details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast]);

  const handleAddToCompare = () => {
    if (!isCompared && !isCompareFull) {
      const result = addToCompare(property._id);
      if (result === 'added_second') navigate('/compare');
      toast({
        title: 'Added to Compare',
        description: 'This property has been added to your compare list.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" thickness="4px" color="primary.500" />
        <Text ml={3} fontSize="lg">Loading property details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error" variant="subtle" flexDirection="column">
          <AlertIcon boxSize="40px" />
          <Heading size="md" mt={4} mb={2}>Error Loading Property</Heading>
          <Text>{error}</Text>
          <Button as={RouterLink} to="/properties" colorScheme="secondary" mt={4}>Back to Listings</Button>
        </Alert>
      </Container>
    );
  }

  if (!property) {
    return <Text textAlign="center" fontSize="lg" mt={10}>Property not found.</Text>;
  }

  return (
    <Box bgGradient="linear(to-br, primary.50, white)" minH="100vh" py={8}>
      <Container maxW="container.x1">
        {/* Header */}
        
        <Flex align="" mb={6} gap={4}>
          <Flex justify="flex-start">
         <Button leftIcon={<FaArrowLeft />} variant="outline" colorScheme="secondary" as={RouterLink} to="/properties" size="sm">
           Back to Listings
         </Button>
        </Flex>
          <Heading size="lg" color="primary.700" flex={1}>
            {property.title}
          </Heading>
          <Tag
            colorScheme={property.status === "for sale" ? "green" : "orange"}
            fontWeight="bold"
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
          >
            {property.status.toUpperCase()}
          </Tag>
        </Flex>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Images & Actions */}
          <Box>
            <AspectRatio ratio={16 / 9} borderRadius="xl" overflow="hidden" mb={4} shadow="lg">
              <Image
                src={property.imageUrls?.[0] || ""}
                alt="Main property"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/600x400?text=No+Image"
              />
            </AspectRatio>
            {property.imageUrls && property.imageUrls.length > 1 && (
              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2} mb={4}>
                {property.imageUrls.slice(1, 7).map((url, idx) => (
                  <AspectRatio ratio={4 / 3} key={idx} borderRadius="md" overflow="hidden">
                    <Image src={url} alt={`Property image ${idx + 2}`} objectFit="cover" />
                  </AspectRatio>
                ))}
              </SimpleGrid>
            )}
            <Flex gap={3} mt={2}>
              <Button
                colorScheme={isCompared ? "gray" : "purple"}
                variant={isCompared ? "outline" : "solid"}
                onClick={handleAddToCompare}
                isDisabled={isCompared || isCompareFull}
                {...buttonProps}
                size="sm"
                flex={1}
              >
                {isCompared
                  ? "Added to Compare"
                  : isCompareFull
                  ? "Compare Full"
                  : "Add to Compare"}
              </Button>
              <Button
                colorScheme="secondary"
                onClick={() => setVisitModalOpen(true)}
                {...buttonProps}
                size="sm"
                flex={1}
              >
                Request Visit
              </Button>
            </Flex>
          </Box>

{/* NEW AUCTION INFO BOX */}

          {liveAuction && (
            <Box 
              bg="orange.50" 
              p={6} 
              borderRadius="xl" 
              border="2px"
              borderColor="orange.200"
              textAlign="center"
              gridColumn="1 / -1"
              my={6}
            >
              <Heading size="md" color="orange.800">This Property is Up for Auction!</Heading>
              <Text mt={2} color="gray.600">
                An exciting opportunity to place your bid. The auction is currently <strong>{liveAuction.status}</strong>.
              </Text>
              {liveAuction.status !== 'Ended' && (
                <Text mt={2} color="gray.700">
                  <b>Ends In:</b> <CountdownTimer endTime={liveAuction.endTime} />
                </Text>
              )}
              <Button
                colorScheme="orange"
                mt={4}
                onClick={() => setAuctionOpen(true)}
                {...buttonProps}
              >
                View Auction & Place Bid
              </Button>
            </Box>
          )}
      {/* Auction Popup Modal */}
      {liveAuction && (
        <AuctionPopup
          isOpen={isAuctionOpen}
          onClose={() => setAuctionOpen(false)}
          auction={{
            ...liveAuction,
            propertyTitle: property.title,
          }}
          onBid={() => {/* TODO: open bid form/modal or handle bid */}}
        />
      )}

          {/* Details */}
          <Box bg="white" p={8} borderRadius="2xl" shadow="xl">
            <Stack spacing={5}>
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                  LKR {property.price?.toLocaleString()} M
                </Text>
                <Text fontSize="md" color="gray.500">
                  Added:{" "}
                  {property.dateAdded
                    ? new Date(property.dateAdded).toLocaleDateString()
                    : "N/A"}
                </Text>
              </Flex>
              <Divider />
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <Flex align="center">
                  <Icon as={FaBed} mr={2} color="primary.500" />{" "}
                  <Text>{property.bedrooms} Bedrooms</Text>
                </Flex>
                {property.bathrooms !== undefined && (
                  <Flex align="center">
                    <Icon as={FaBath} mr={2} color="primary.500" />{" "}
                    <Text>{property.bathrooms} Baths</Text>
                  </Flex>
                )}
                <Flex align="center">
                  <Icon as={FaRulerCombined} mr={2} color="primary.500" />{" "}
                  <Text>{property.area} sq ft</Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} mr={2} color="primary.500" />{" "}
                  <Text>{property.address}</Text>
                </Flex>
                <Flex align="center">
                  <Text>
                    <strong>Type:</strong> {property.propertyType}
                  </Text>
                </Flex>
              </SimpleGrid>
              <Divider />
              <Box>
                <Heading size="sm" mb={2}>
                  Description
                </Heading>
                <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
                  {property.description}
                </Text>
              </Box>
              <Divider />
              <Box>
                <Heading size="sm" mb={2}>
                  Location
                </Heading>
                <Text fontSize="sm">{property.address}</Text>
                <AspectRatio ratio={16 / 9} borderRadius="md" overflow="hidden" mt={2}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      property.address
                    )}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location Map"
                  ></iframe>
                </AspectRatio>
              </Box>
            </Stack>
          </Box>
        </SimpleGrid>

        {/* Visit Modal */}
        <Modal
          isOpen={isVisitModalOpen}
          onClose={() => setVisitModalOpen(false)}
          isCentered
          size="lg"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Request a Visit</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VisitRequestForm
                propertyId={property._id}
                propertyTitle={property.title}
                onFormSubmitSuccess={() => setVisitModalOpen(false)}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default PropertyDetailsPage;
