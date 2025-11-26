import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, Button, Flex, Icon,
  Image, useToast, Center, VStack, Divider, Grid,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  useBreakpointValue // Import useBreakpointValue
} from '@chakra-ui/react';
import {
  FaTrash, FaInfoCircle, FaBed, FaRulerCombined, FaDollarSign,
  FaBuilding, FaTags, FaMapMarkerAlt, FaCalendarAlt, FaBath
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import axios from '../api/axiosInstance';


//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getNestedValue = (obj, path) => {
  if (!obj || typeof obj !== 'object' || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' && part in acc) ? acc[part] : undefined, obj);
};

const ComparePropertiesPage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [propertiesDetails, setPropertiesDetails] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchPropertyDetailsForComparison = useCallback(async (idsToFetch) => {
    if (!Array.isArray(idsToFetch) || idsToFetch.length !== 2) {
      setLoading(false);
      setPropertiesDetails([null, null]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
    // 1. Create an array of promises using axios.get.
    //    axios.get already returns a promise, so the structure is simpler.
    const promises = idsToFetch.map(id => {
        if (!id) return Promise.resolve(null); // Handle null/empty IDs
        // Use a relative path. axios adds the base URL automatically.
        return axios.get(`/properties/${id}`);
    });

    // 2. Wait for all the axios requests to complete.
    const responses = await Promise.all(promises);

    // 3. Extract the data from each response.
    //    With axios, the JSON data is in the .data property.
    const results = responses.map(response => response ? response.data : null);

    // 4. Set your state with the final data.
    setPropertiesDetails([results[0] || null, results[1] || null]);
    } catch (err) {
      setError(err.message || 'Failed to load property details.');
      toast({
        title: "Error Loading Details",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      setPropertiesDetails([null, null]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (compareList && compareList.length === 2) {
      fetchPropertyDetailsForComparison(compareList);
    } else {
      setLoading(false);
      setPropertiesDetails([null, null]);
    }
  }, [compareList, fetchPropertyDetailsForComparison]);

  const handleRemoveAndReselect = (propertyIdToRemove) => {
    removeFromCompare(propertyIdToRemove);
    navigate('/properties');
  };

  const handleStartNewComparison = () => {
    clearCompare();
    toast({ title: "Comparison Cleared", description: "Select new properties.", status: "info", duration: 3000, isClosable: true, position: "top-right" });
    navigate('/properties');
  };

  const [property1, property2] = propertiesDetails;
  const canCompare = property1 && typeof property1 === 'object' && property1._id &&
    property2 && typeof property2 === 'object' && property2._id &&
    compareList && compareList.length === 2;

  // Responsive values using useBreakpointValue
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  // headingSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  const subHeadingSize = useBreakpointValue({ base: "sm", md: "md" });
  const textSize = useBreakpointValue({ base: "xs", md: "sm" });
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const imageH = useBreakpointValue({ base: "150px", md: "200px" });
  const gridTemplateColumns = useBreakpointValue({ base: "1fr", md: "1fr auto 1fr" });
  const gridGap = useBreakpointValue({ base: 6, md: 8 });
  const vsTextDisplay = useBreakpointValue({ base: "none", md: "flex" });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const featureIconSize = useBreakpointValue({ base: "0.9em", md: "1em" });
  const tableThMinW = useBreakpointValue({ base: "100px", md: "140px", lg: "200px" });
  const tableTdMinW = useBreakpointValue({ base: "100px", md: "120px", lg: "180px" });


  if (loading) {
    return (
      <Center minH="calc(100vh - 200px)">
        <Spinner size="xl" thickness="4px" color="green.500" emptyColor="gray.200" />
        <Text ml={3} fontSize="lg">Loading Comparison...</Text>
      </Center>
    );
  }

  if (!canCompare) {
    if (error) {
      return (
        <Flex direction="column" align="center" justify="center" minH="calc(100vh - 200px)" p={5} textAlign="center">
          <Icon as={FaInfoCircle} boxSize="40px" color="red.500" mb={4} />
          <Heading as="h2" size="lg" mb={3}>Error Loading Comparison</Heading>
          <Text mb={2}>There was an issue fetching details for the properties.</Text>
          <Alert status="error" mb={6} maxW="lg" borderRadius="md" variant="subtle"><AlertIcon />{error}</Alert>
          <Button colorScheme="primary" onClick={handleStartNewComparison}>Try Again or Start New</Button>
        </Flex>
      );
    }
    return (
      <Flex direction="column" align="center" justify="center" minH="calc(100vh - 200px)" p={5} textAlign="center">
        <Icon as={FaInfoCircle} boxSize="40px" color="green.500" mb={4} />
        <Heading as="h2" size="lg" mb={3}>Select Two Properties to Compare</Heading>
        <Text mb={6}>You currently have {compareList ? compareList.length : 0} properties selected.</Text>
        <Button colorScheme="primary" onClick={() => navigate('/properties')}>Browse Properties</Button>
      </Flex>
    );
  }

  // --- Features to Compare ---
  const featuresToCompare = [
    { key: 'price', label: 'Price', format: (val) => val != null ? `LKR ${Number(val).toLocaleString()} M` : 'N/A', icon: FaDollarSign, betterIf: 'lower' },
    { key: 'area', label: 'Area (sq m)', icon: FaRulerCombined, betterIf: 'higher' },
    { key: 'bedrooms', label: 'Bedrooms', icon: FaBed, betterIf: 'higher' },
    { key: 'bathrooms', label: 'Bathrooms', icon: FaBath, betterIf: 'higher' },
    { key: 'propertyType', label: 'Type', format: (val) => val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : 'N/A', icon: FaBuilding },
    { key: 'status', label: 'Status', format: (val) => val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : 'N/A', icon: FaTags },
    { key: 'address.city', label: 'City', icon: FaMapMarkerAlt },
    { key: 'dateAdded', label: 'Listed On', format: (val) => val ? new Date(val).toLocaleDateString() : 'N/A', icon: FaCalendarAlt },
  ];

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1100px" mx="auto"> {/* Increased base padding */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        wrap={{ base: "wrap", md: "nowrap" }} // Wrap on small screens
        direction={{ base: "column", md: "row" }} // Stack on small, row on large
        gap={4} // Increased gap for mobile
      >
        <Heading as="h1" size="xl" color="green.700" textAlign={{ base: "center", md: "left" }} w="full">
          Property Comparison
        </Heading>
        <Button
          colorScheme="primary"
          variant="solid"
          onClick={handleStartNewComparison}
          size={buttonSize}
          borderWidth="6px"
          w={{ base: "full", md: "auto" }} // Full width on mobile
        >
          Start New Comparison
        </Button>
      </Flex>

      {/* --- Property Header CARDS section --- */}
      <Grid templateColumns={gridTemplateColumns} gap={gridGap} alignItems="stretch" mb={8}>
        {/* Property 1 */}
        <VStack
          spacing={3}
          align="stretch"
          p={cardPadding}
          borderWidth="2px"
          borderRadius="2xl"
          shadow="2xl"
          bg="green.50"
          justifyContent="space-between"
        >
          <Box>
            <RouterLink to={`/properties/${property1._id}`}>
              <Image
                src={property1.imageUrls && property1.imageUrls[0] ? property1.imageUrls[0] : "https://via.placeholder.com/350x220.png?text=No+Image"}
                alt={property1.title || "Property 1"}
                h={imageH}
                w="100%"
                objectFit="cover"
                borderRadius="md"
                mb={3}
              />
              <Heading
                as="h3"
                size={subHeadingSize}
                color="green.700"
                textAlign="center"
                noOfLines={2}
                _hover={{ textDecoration: "underline" }}
                minH={{ base: "auto", md: "3em" }} // Keep minH for consistent card height on desktop
              >
                {property1.title || "Property Information"}
              </Heading>
            </RouterLink>
            <Text fontSize={textSize} color="gray.700" noOfLines={3} textAlign="center" mt={2} minH={{ base: "auto", md: "4.5em" }}>
              {getNestedValue(property1, 'description')?.substring(0, 100) || "No description available."}...
            </Text>
          </Box>
          <Button colorScheme="red" variant="ghost" size={buttonSize} onClick={() => handleRemoveAndReselect(property1._id)} leftIcon={<FaTrash />} mt={3} alignSelf="center">
            Remove
          </Button>
        </VStack>

        {/* VS Divider (shown only on md and larger) */}
        <Center display={vsTextDisplay} alignSelf="center">
          <Text fontSize="4xl" fontWeight="bold" color="green.300">VS</Text>
        </Center>

        {/* Property 2 */}
        <VStack
          spacing={3}
          align="stretch"
          p={cardPadding}
          borderWidth="2px"
          borderRadius="2xl"
          shadow="2xl"
          bg="green.50"
          justifyContent="space-between"
        >
          <Box>
            <RouterLink to={`/properties/${property2._id}`}>
              <Image
                src={property2.imageUrls && property2.imageUrls[0] ? property2.imageUrls[0] : "https://via.placeholder.com/350x220.png?text=No+Image"}
                alt={property2.title || "Property 2"}
                h={imageH}
                w="100%"
                objectFit="cover"
                borderRadius="md"
                mb={3}
              />
              <Heading
                as="h3"
                size={subHeadingSize}
                color="green.700"
                textAlign="center"
                noOfLines={2}
                _hover={{ textDecoration: "underline" }}
                minH={{ base: "auto", md: "3em" }}
              >
                {property2.title || "Property Information"}
              </Heading>
            </RouterLink>
            <Text fontSize={textSize} color="gray.700" noOfLines={3} textAlign="center" mt={2} minH={{ base: "auto", md: "4.5em" }}>
              {getNestedValue(property2, 'description')?.substring(0, 100) || "No description available."}...
            </Text>
          </Box>
          <Button colorScheme="red" variant="ghost" size={buttonSize} onClick={() => handleRemoveAndReselect(property2._id)} leftIcon={<FaTrash />} mt={3} alignSelf="center">
            Remove
          </Button>
        </VStack>
      </Grid>

      <Divider my={8} borderColor="green.200" />

      {/* --- Features Comparison Table --- */}
      <TableContainer borderWidth="2px" borderRadius="xl" shadow="2xl" bg="white" overflowX="auto">
        <Table variant="simple" colorScheme="primary" size={tableSize}>
          <Thead bg="green.100">
            <Tr>
              <Th
                p={{ base: 3, md: 4 }}
                minW={tableThMinW}
                position="sticky"
                left={0}
                bg="green.100"
                zIndex={10}
                textTransform="uppercase"
                letterSpacing="wider"
                fontSize={{ base: "xx-small", md: "xs" }} // Smaller font for TH
                fontWeight="bold"
                color="green.700"
                borderRightWidth="2px"
                borderColor="green.200"
              ></Th>
              <Th p={{ base: 3, md: 4 }} minW={tableTdMinW} textAlign="center">
                <RouterLink to={`/properties/${property1._id}`}>
                  <Text fontWeight="bold" color="green.700" noOfLines={2} fontSize={{ base: "xs", md: "sm" }}>{property1.title || "Property 1"}</Text>
                </RouterLink>
              </Th>
              <Th p={{ base: 3, md: 4 }} minW={tableTdMinW} textAlign="center">
                <RouterLink to={`/properties/${property2._id}`}>
                  <Text fontWeight="bold" color="green.700" noOfLines={2} fontSize={{ base: "xs", md: "sm" }}>{property2.title || "Property 2"}</Text>
                </RouterLink>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {featuresToCompare.map((feature) => {
              const val1 = getNestedValue(property1, feature.key);
              const val2 = getNestedValue(property2, feature.key);

              const formatValue = (val, fmtFunc) => {
                if (val == null) return 'N/A';
                if (fmtFunc) return fmtFunc(val);
                if (typeof val === 'boolean') return val ? 'Yes' : 'No';
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
              };

              const displayVal1 = formatValue(val1, feature.format);
              const displayVal2 = formatValue(val2, feature.format);

              let isVal1Better = false;
              let isVal2Better = false;

              if (val1 != null && val2 != null && JSON.stringify(val1) !== JSON.stringify(val2)) {
                if (feature.betterIf === 'higher') {
                  if (Number(val1) > Number(val2)) isVal1Better = true;
                  else if (Number(val2) > Number(val1)) isVal2Better = true;
                } else if (feature.betterIf === 'lower') {
                  if (Number(val1) < Number(val2)) isVal1Better = true;
                  else if (Number(val2) < Number(val1)) isVal2Better = true;
                } else if (typeof val1 === 'boolean' && typeof val2 === 'boolean') {
                  if (val1 === true && val2 === false) isVal1Better = true;
                  else if (val2 === true && val1 === false) isVal2Better = true;
                }
              }

              return (
                <Tr key={feature.key} _hover={{ bg: "green.50" }}>
                  <Td
                    fontWeight="medium"
                    p={{ base: 3, md: 4 }}
                    position="sticky"
                    left={0}
                    bg="green.50"
                    zIndex={5}
                    borderRightWidth="2px"
                    borderColor="green.100"
                  >
                    <Flex align="center">
                      {feature.icon && <Icon as={feature.icon} mr={2} color="green.400" boxSize={featureIconSize} />}
                      <Text fontSize={textSize} color="green.900" noOfLines={1}>{feature.label}</Text>
                    </Flex>
                  </Td>
                  <Td p={{ base: 3, md: 4 }} textAlign="center">
                    <Text
                      fontSize={textSize}
                      fontWeight={isVal1Better ? "extrabold" : "normal"}
                      color={isVal1Better ? "green.700" : "gray.700"}
                      bg={isVal1Better ? "green.100" : "transparent"}
                      borderRadius="full"
                      px={isVal1Better ? 2 : 0} // Smaller padding on mobile
                      py={isVal1Better ? 0.5 : 0} // Smaller padding on mobile
                      display="inline-block"
                      noOfLines={feature.noOfLines || 1}
                    >
                      {displayVal1}
                    </Text>
                  </Td>
                  <Td p={{ base: 3, md: 4 }} textAlign="center">
                    <Text
                      fontSize={textSize}
                      fontWeight={isVal2Better ? "extrabold" : "normal"}
                      color={isVal2Better ? "green.700" : "gray.700"}
                      bg={isVal2Better ? "green.100" : "transparent"}
                      borderRadius="full"
                      px={isVal2Better ? 2 : 0} // Smaller padding on mobile
                      py={isVal2Better ? 0.5 : 0} // Smaller padding on mobile
                      display="inline-block"
                      noOfLines={feature.noOfLines || 1}
                    >
                      {displayVal2}
                    </Text>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ComparePropertiesPage;