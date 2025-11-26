import React, { useEffect } from 'react';
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody,
  IconButton, Box, Flex, Heading, Button, Center, VStack, Grid, Text, Divider, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Icon, useDisclosure
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import { FaTrash } from 'react-icons/fa';
//import { useCompare } from '../context/CompareContext';
import { Link as RouterLink } from 'react-router-dom';

// Helper to get nested value
const getNestedValue = (obj, path) => {
  if (!obj || typeof obj !== 'object' || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' && part in acc) ? acc[part] : undefined, obj);
};

const featuresToCompare = [
  { key: 'price', label: 'Price', format: (val) => val != null ? `$${Number(val).toLocaleString()}` : 'N/A', betterIf: 'lower' },
  { key: 'area', label: 'Area (sq m)', betterIf: 'higher' },
  { key: 'bedrooms', label: 'Bedrooms', betterIf: 'higher' },
  { key: 'bathrooms', label: 'Bathrooms', betterIf: 'higher' },
  { key: 'propertyType', label: 'Type', format: (val) => val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : 'N/A' },
  { key: 'status', label: 'Status', format: (val) => val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : 'N/A' },
  { key: 'address.city', label: 'City' },
  { key: 'dateAdded', label: 'Listed On', format: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
];

const CompareDrawer = ({ propertiesDetails, onRemove, onStartNew, canCompare }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [property1, property2] = propertiesDetails || [];

  // Open drawer automatically when two properties are selected
  useEffect(() => {
    if (canCompare) onOpen();
    else onClose();
    // eslint-disable-next-line
  }, [canCompare]);

  // Floating button to open/close the comparison drawer
  const FloatingCompareButton = () => (
    <IconButton
      icon={<ChatIcon boxSize={6} />}
      colorScheme="secondary"
      aria-label="Show Property Comparison"
      position="fixed"
      bottom={{ base: 6, md: 10 }}
      right={{ base: 6, md: 10 }}
      zIndex={2000}
      size="lg"
      borderRadius="full"
      boxShadow="lg"
      onClick={isOpen ? onClose : onOpen}
      _hover={{ bg: 'primary.600' }}
    />
  );

  // Show notification if only one property is selected
  const showNotification = propertiesDetails && propertiesDetails.length === 1;

  if (!canCompare && !showNotification) return null;

  return (
    <>
      {showNotification && (
        <Box
          position="fixed"
          bottom={{ base: 20, md: 24 }}
          right={{ base: 6, md: 10 }}
          zIndex={2100}
          bg="orange.100"
          color="orange.800"
          px={4}
          py={2}
          borderRadius="md"
          boxShadow="md"
          fontWeight="semibold"
        >
          Select another property to compare.
        </Box>
      )}
      {canCompare && <FloatingCompareButton />}
      {canCompare && (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
          <DrawerOverlay />
          <DrawerContent maxW={{ base: '100vw', md: '900px' }}>
            <DrawerCloseButton />
            <DrawerHeader>Property Comparison</DrawerHeader>
            <DrawerBody p={0} bg="gray.50">
              <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
                <Flex justifyContent="space-between" alignItems="center" mb={6} wrap="wrap" gap={2}>
                  <Heading as="h1" size={{base: "lg", md: "xl"}} color="gray.700">Property Comparison</Heading>
                  <Button colorScheme="orange" variant="outline" onClick={onStartNew} size="sm" borderWidth="2px">Start New Comparison</Button>
                </Flex>
                {/* --- Property Header CARDS section --- */}
                <Grid templateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap={{ base: 4, md: 6 }} alignItems="stretch" mb={8}>
                  <VStack spacing={3} align="stretch" p={4} borderWidth="1px" borderRadius="xl" shadow="lg" bg="white" justifyContent="space-between">
                    <Box>
                      <RouterLink to={`/properties/${property1._id}`}>
                        <img
                          src={property1.imageUrls && property1.imageUrls[0] ? property1.imageUrls[0] : "https://via.placeholder.com/350x220.png?text=No+Image"}
                          alt={property1.title || "Property 1"}
                          style={{ height: '180px', width: '100%', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                        />
                        <Heading as="h3" size="md" color="blue.600" textAlign="center" noOfLines={2} _hover={{textDecoration:"underline"}} minH={{base:"auto", md:"3em"}}>
                          {property1.title || "Property Information"}
                        </Heading>
                      </RouterLink>
                      <Text fontSize="sm" color="gray.500" noOfLines={3} textAlign="center" mt={2} minH={{base:"auto", md:"4.5em"}}>
                        {getNestedValue(property1, 'description')?.substring(0,100) || "No description available."}...
                      </Text>
                    </Box>
                    <Button colorScheme="red" variant="ghost" size="sm" onClick={() => onRemove(property1._id)} leftIcon={<FaTrash />} mt={3} alignSelf="center">Remove</Button>
                  </VStack>
                  <Center display={{ base: "none", md: "flex" }} alignSelf="center">
                    <Text fontSize="4xl" fontWeight="bold" color="gray.300">VS</Text>
                  </Center>
                  <VStack spacing={3} align="stretch" p={4} borderWidth="1px" borderRadius="xl" shadow="lg" bg="white" justifyContent="space-between">
                    <Box>
                      <RouterLink to={`/properties/${property2._id}`}>
                        <img
                          src={property2.imageUrls && property2.imageUrls[0] ? property2.imageUrls[0] : "https://via.placeholder.com/350x220.png?text=No+Image"}
                          alt={property2.title || "Property 2"}
                          style={{ height: '180px', width: '100%', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                        />
                        <Heading as="h3" size="md" color="green.600" textAlign="center" noOfLines={2} _hover={{textDecoration:"underline"}} minH={{base:"auto", md:"3em"}}>
                          {property2.title || "Property Information"}
                        </Heading>
                      </RouterLink>
                      <Text fontSize="sm" color="gray.500" noOfLines={3} textAlign="center" mt={2} minH={{base:"auto", md:"4.5em"}}>
                        {getNestedValue(property2, 'description')?.substring(0,100) || "No description available."}...
                      </Text>
                    </Box>
                     <Button colorScheme="red" variant="ghost" size="sm" onClick={() => onRemove(property2._id)} leftIcon={<FaTrash />} mt={3} alignSelf="center">Remove</Button>
                  </VStack>
                </Grid>
                <Divider my={8} borderColor="gray.300" />
                {/* --- Features Comparison Table --- */}
                <TableContainer borderWidth="1px" borderRadius="lg" shadow="xl" bg="white" overflowX="auto">
                  <Table variant="striped" colorScheme="gray" size={{ base: "sm", md: "md" }}>
                    <Thead bg="gray.100">
                      <Tr>
                        <Th p={{base:3, md:4}} minW={{base:"140px", md:"200px"}} position="sticky" left={0} bg="gray.100" zIndex={10} textTransform="uppercase" letterSpacing="wider" fontSize="xs" fontWeight="bold" color="gray.600" borderRightWidth="1px" borderColor="gray.300" >
                        </Th>
                        <Th p={{base:3, md:4}} minW={{base:"120px", md:"180px"}} textAlign="center">
                          <RouterLink to={`/properties/${property1._id}`}>
                              <Text fontWeight="bold" color="blue.600" noOfLines={2}>{property1.title || "Property 1"}</Text>
                          </RouterLink>
                        </Th>
                        <Th p={{base:3, md:4}} minW={{base:"120px", md:"180px"}} textAlign="center">
                           <RouterLink to={`/properties/${property2._id}`}>
                              <Text fontWeight="bold" color="green.600" noOfLines={2}>{property2.title || "Property 2"}</Text>
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
                          <Tr key={feature.key} _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="medium" p={{base:3, md:4}} position="sticky" left={0} bg={ (feature.key === "price" || feature.key === "area") ? "gray.50" : "inherit"} zIndex={5} borderRightWidth="1px" borderColor="gray.200" >
                                <Flex align="center">
                                   <Text fontSize={{base:"xs", md:"sm"}} color="gray.800" noOfLines={1}>{feature.label}</Text>
                                </Flex>
                            </Td>
                            <Td p={{base:3, md:4}} textAlign="center">
                              <Text fontSize={{base:"xs", md:"sm"}} fontWeight={isVal1Better ? "bold" : "normal"} color={isVal1Better ? "green.600" : "gray.700"} bg={isVal1Better ? "green.50" : "transparent"} px={isVal1Better ? 2 : 0} py={isVal1Better ? 1 : 0} borderRadius="md" display="inline-block" noOfLines={feature.noOfLines || 1}>
                                {displayVal1}
                              </Text>
                            </Td>
                            <Td p={{base:3, md:4}} textAlign="center">
                              <Text fontSize={{base:"xs", md:"sm"}} fontWeight={isVal2Better ? "bold" : "normal"} color={isVal2Better ? "green.600" : "gray.700"} bg={isVal2Better ? "green.50" : "transparent"} px={isVal2Better ? 2 : 0} py={isVal2Better ? 1 : 0} borderRadius="md" display="inline-block" noOfLines={feature.noOfLines || 1}>
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
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default CompareDrawer;