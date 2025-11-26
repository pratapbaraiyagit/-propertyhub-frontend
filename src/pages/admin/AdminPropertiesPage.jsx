// frontend/src/pages/admin/AdminPropertiesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tag,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  useBreakpointValue, 
  SimpleGrid,// Import useBreakpointValue for more dynamic checks
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from '../../api/axiosInstance';

const sriLankanDistricts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];



const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // Default sort
  const toast = useToast();

  // Determine if it's a mobile view for conditional rendering/styling
  const isMobile = useBreakpointValue({ base: true, md: false });

  // const fetchProperties = useCallback(async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {

  //     // Pass searchTerm as a query parameter for filtering
  //     const response = await axios.get(`${API_ROOT_URL}/api/properties`, {
  //       params: { search: searchTerm }
  //     });
  //     setProperties(response.data || []);
  //   } catch (err) {
  //     console.error("Error fetching properties:", err);
  //     const errMsg = err.response?.data?.message || err.message || "Could not load properties.";
  //     setError(errMsg);
  //     toast({
  //       title: 'Error fetching properties.',
  //       description: errMsg,
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [searchTerm, toast]);

  const response = await axios.get('/admin/properties', {
        params: { 
          search: searchTerm,
          district: selectedDistrict,
          sort: sortBy,
        }
      });
      setProperties(response.data || []);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Could not load properties.";
      setError(errMsg);
      toast({ title: 'Error fetching properties', description: errMsg, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDistrict, sortBy, toast]); 

  useEffect(() => {
    // Debounce to prevent API calls on every keystroke
    const handler = setTimeout(() => {
      fetchProperties();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchProperties]); 

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    try {
   await axios.delete(`/admin/properties/${propertyId}`);
      toast({
        title: 'Property Deleted.',
        description: 'The property has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchProperties(); // Refetch properties to update the list
    } catch (err) {
      console.error("Error deleting property:", err);
      const errMsg = err.response?.data?.message || err.message || "Could not delete property.";
      toast({
        title: 'Error Deleting Property.',
        description: errMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'for sale': return 'green';
      case 'sold': return 'red';
      case 'pending': return 'orange';
      case 'rented': return 'blue'; // Example for another status
      default: return 'gray';
    }
  };

  return (
    <Box
      maxW="100vw"
      px={{ base: 2, md: 6, lg: 8 }} // More granular horizontal padding
      py={{ base: 4, md: 8 }}     // Vertical padding
      mx="auto"                   // Center the content within the maxW
      minH="100vh"
      bg="gray.50"                // Add a subtle background color
    >
      {/* Header and Add Property Button */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mb={6}
        gap={{ base: 4, md: 0 }} // Gap between elements on small screens
      >
        <Heading
          as="h1"
          size={{ base: 'lg', md: 'xl' }}
          color="gray.800"
          textAlign={{ base: 'center', md: 'left' }}
          mb={{ base: 4, md: 0 }} // Margin below heading on small screens
        >
          Manage Properties
        </Heading>
        <Button
          as={RouterLink}
          to="/admin/properties/add"
          colorScheme="primary"
          bg="primary.700"
          _hover={{ bg: 'primary.800', transform: 'scale(1.02)', color: "white" }} // Slightly less aggressive hover
          leftIcon={<FaPlus />} // Add an icon to the button
          w={{ base: '100%', md: 'auto' }} // Full width on small screens, auto on larger
          px={{ base: 4, md: 6 }} // Padding for the button
          py={{ base: 2, md: 3 }}
          fontSize={{ base: 'md', md: 'lg' }}
        >
          Add New Property
        </Button>
      </Flex>

      {/* Search Input */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
      <InputGroup mb={6} maxW={{ base: '100%', md: 'sm' }} mx={{ base: 'auto', md: '0' }}> {/* Center on mobile, left on desktop */}
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search by title, address, type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fontSize={{ base: 'sm', md: 'md' }}
          bg="white"
          borderColor="gray.200"
          _hover={{ borderColor: 'gray.300' }}
          _focus={{ borderColor: 'blue.400', boxShadow: 'outline' }}
          pl={10} // Adjust padding to make space for the icon
        />
      </InputGroup>

      <Select
          placeholder="Filter by District"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          {sriLankanDistricts.sort().map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </Select>

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Sort by Newest</option>
          <option value="district">Sort by District</option>
          <option value="price_asc">Sort by Price (Low to High)</option>
          <option value="price_desc">Sort by Price (High to Low)</option>
        </Select>
      </SimpleGrid>

      {/* Loading, Error, and No Properties States */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px" direction="column" w="100%">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={3} fontSize="lg" color="gray.600">Loading properties...</Text>
        </Flex>
      )}

      {error && !isLoading && (
        <Alert status="error" mb={6} borderRadius="md" boxShadow="sm" w="100%">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="bold">Error loading properties:</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <Flex direction="column" align="center" justify="center" minH="200px" p={4} bg="white" borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" color="gray.600" mb={2}>No properties found.</Text>
          <Button
            as={RouterLink}
            to="/admin/properties/add"
            colorScheme="blue"
            variant="link"
            leftIcon={<FaPlus />}
          >
            Add the first one!
          </Button>
        </Flex>
      )}

      {/* Properties Table */}
      {!isLoading && !error && properties.length > 0 && (
        // Wrap the table in a Box with overflowX="auto" to handle horizontal scrolling on small screens
        <Box w="100%" overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="md" boxShadow="sm" bg="white">
          <Table variant="simple" size={isMobile ? 'sm' : 'md'} minW="700px"> {/* minW ensures table doesn't get too squished */}
            <Thead bg="gray.100">
              <Tr>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Title</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Type</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Address</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }} isNumeric>Price (LKR)</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Status</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} py={{ base: 2, md: 3 }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {properties.map((property) => (
                <Tr key={property._id} _hover={{ bg: 'gray.50' }}>
                  <Td maxW={{ base: '150px', md: '250px' }} whiteSpace="normal" wordBreak="break-word">
                    <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }} color="gray.700">{property.title}</Text>
                  </Td>
                  <Td textTransform="capitalize" fontSize={{ base: 'sm', md: 'md' }}>{property.propertyType}</Td>
                  <Td maxW={{ base: '150px', md: '250px' }} whiteSpace="normal" wordBreak="break-word" fontSize={{ base: 'sm', md: 'md' }}>{property.address}</Td>
                  <Td isNumeric fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                    {property.price ? `LKR ${Number(property.price).toLocaleString()} M` : 'N/A'}
                  </Td>
                  <Td>
                    <Tag size={isMobile ? "sm" : "md"} colorScheme={getStatusColor(property.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                      {property.status || 'Unknown'}
                    </Tag>
                  </Td>
                  <Td>
                    {/* Use isMobile to conditionally render vertical stack or horizontal stack */}
                    {isMobile ? (
                      <VStack spacing={1} align="stretch">
                        <IconButton
                          as={RouterLink}
                          to={`/admin/properties/edit/${property._id}`}
                          icon={<FaEdit />}
                          aria-label="Edit Property"
                          colorScheme="blue"
                          size="xs" // Smaller buttons on mobile
                          variant="outline"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Delete Property"
                          colorScheme="red"
                          size="xs"
                          variant="outline"
                          onClick={() => handleDeleteProperty(property._id)}
                        />
                      </VStack>
                    ) : (
                      <HStack spacing={2}>
                        <IconButton
                          as={RouterLink}
                          to={`/admin/properties/edit/${property._id}`}
                          icon={<FaEdit />}
                          aria-label="Edit Property"
                          colorScheme="blue"
                          size="sm"
                          variant="ghost"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Delete Property"
                          colorScheme="red"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProperty(property._id)}
                        />
                      </HStack>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default AdminPropertiesPage;