import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  Collapse,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropertyCard from '../components/PropertyCard';
import useDebounce from '../hooks/useDebounce';
import { buttonProps } from '../theme/ui';
import { useCompare } from '../context/CompareContext';
import axios from '../api/axiosInstance';

//const API_BASE_URL = import.meta.env.VITE_API_URL;
//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 500);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
    listingType: '',
  });
  const [sortOptions, setSortOptions] = useState({
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Use compare context
  const { compareList } = useCompare();
  const toast = useToast();
  const prevCompareLength = useRef(0);

  // Show toast ONLY when compareList transitions from 0 to 1
  useEffect(() => {
    if (prevCompareLength.current === 0 && compareList.length === 1) {
      toast({
        title: "Select another property to compare.",
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "top",
        containerStyle: {
          background: "#FFE5B4", // light orange
          borderRadius: "8px",
        },
      });
    }
    prevCompareLength.current = compareList.length;
  }, [compareList, toast]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    const queryParams = new URLSearchParams();

    if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
    if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
    if (filters.listingType) queryParams.append('listingType', filters.listingType);
    queryParams.append('sortBy', sortOptions.sortBy);
    queryParams.append('sortOrder', sortOptions.sortOrder);

    //const queryString = queryParams.toString();
try {
    // 1. Make the API call with axios.
    const response = await axios.get('/properties', { params: queryParams });

    // 2. The data is already in response.data. Set your state once. That's it!
    setProperties(response.data);

} catch (err) {
    console.error("Failed to fetch properties:", err);
    // This catch block is already perfect for handling axios errors.
    setError(err.response?.data?.message || 'Failed to fetch properties.');
} finally {
    setLoading(false);
}
  }, [debouncedSearchTerm, filters, sortOptions]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearchChange = (e) => {
    setSearchTermInput(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortOptions(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchTermInput('');
    setFilters({ minPrice: '', maxPrice: '', bedrooms: '', propertyType: '', listingType: '' });
    setSortOptions({ sortBy: 'dateAdded', sortOrder: 'desc' });
  };

  return (
    <Flex
      minH="100dvh"
      direction="column"
      bg="#f7fafc"
      m={0}
      p={0}
      overflowX="hidden"
    >
      <Box
        width="100%"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 4, md: 8 }}
        display="flex"
        flexDirection="column"
        flex="1"
      >
        <Stack spacing={6} mb={8}>
          <Heading as="h1" size="xl" textAlign="center">
            Explore Properties
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            Find your next dream home or investment.
          </Text>
        </Stack>

        {/* Filters and Search Section - Collapsible */}
        <Box mb={8}>
          <Button
            onClick={() => setFiltersOpen((open) => !open)}
            {...buttonProps}
            rightIcon={filtersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            w={{ base: '100%', md: 'auto' }}
            mb={2}
          >
            {filtersOpen ? 'Hide Filters & Search' : 'Show Filters & Search'}
          </Button>
          <Collapse in={filtersOpen} animateOpacity>
            <Box p={{ base: 3, md: 4 }} shadow="md" borderWidth="1px" borderRadius="md" mt={2} bg="green.600">
              <Stack spacing={{ base: 3, md: 4 }}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                  {/* Search Bar */}
                  <FormControl>
                    <FormLabel htmlFor="searchTermInput" fontSize={{ base: "sm", md: "md" }}>Search Properties</FormLabel>
                    <InputGroup size={{ base: "sm", md: "md" }}>
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        id="searchTermInput"
                        placeholder="Keywords (e.g., villa, park view)"
                        value={searchTermInput}
                        onChange={handleSearchChange}
                        bg="white"
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Min Price */}
                  <FormControl>
                    <FormLabel htmlFor="minPrice" fontSize={{ base: "sm", md: "md" }}>Min Price</FormLabel>
                    <Input
                      id="minPrice"
                      name="minPrice"
                      type="number"
                      placeholder="Enter in Millions (eg: 50)"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    />
                  </FormControl>

                  {/* Max Price */}
                  <FormControl>
                    <FormLabel htmlFor="maxPrice" fontSize={{ base: "sm", md: "md" }}>Max Price</FormLabel>
                    <Input
                      id="maxPrice"
                      name="maxPrice"
                      type="number"
                      placeholder="Enter in Millions (eg: 250)"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    />
                  </FormControl>

                  {/* Bedrooms */}
                  <FormControl>
                    <FormLabel htmlFor="bedrooms" fontSize={{ base: "sm", md: "md" }}>Bedrooms (min)</FormLabel>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      placeholder="e.g., 3"
                      value={filters.bedrooms}
                      onChange={handleFilterChange}
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    />
                  </FormControl>

                  {/* Property Type */}
                  <FormControl>
                    <FormLabel htmlFor="propertyType" fontSize={{ base: "sm", md: "md" }}>Property Type</FormLabel>
                    <Select
                      id="propertyType"
                      name="propertyType"
                      value={filters.propertyType}
                      onChange={handleFilterChange}
                      placeholder="All Types"
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="listingType" fontSize={{ base: "sm", md: "md" }}>Listing Type</FormLabel>
                    <Select
                      id="listingType"
                      name="listingType"
                      value={filters.listingType}
                      onChange={handleFilterChange}
                      placeholder="All Listings"
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <option value="sale">For Sale</option>
                      <option value="auction">Auction</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }} mt={1}>
                  {/* Sort By */}
                  <FormControl>
                    <FormLabel htmlFor="sortBy" fontSize={{ base: "sm", md: "md" }}>Sort By</FormLabel>
                    <Select
                      id="sortBy"
                      name="sortBy"
                      value={sortOptions.sortBy}
                      onChange={handleSortChange}
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <option value="dateAdded">Date Added</option>
                      <option value="price">Price</option>
                      <option value="area">Area</option>
                      <option value="bedrooms">Bedrooms</option>
                    </Select>
                  </FormControl>

                  {/* Order */}
                  <FormControl>
                    <FormLabel htmlFor="sortOrder" fontSize={{ base: "sm", md: "md" }}>Order</FormLabel>
                    <Select
                      id="sortOrder"
                      name="sortOrder"
                      value={sortOptions.sortOrder}
                      onChange={handleSortChange}
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Button onClick={clearFilters} colorScheme="gray" variant="outline" mt={2} size={{ base: "sm", md: "md" }}>
                  Clear All Filters
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </Box>

        {/* Display Area for Properties, Loading, Error */}
        {loading && (
          <Flex
            flex="1"
            justifyContent="center"
            alignItems="center"
            minHeight="calc(100vh - 350px)"
            width="100%"
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="primary.500" />
            <Text ml={3}>Loading properties...</Text>
          </Flex>
        )}

        {error && !loading && (
          <Flex flex="1" justify="center" align="center" p={5} minHeight={{ base: "300px", md: "400px" }}>
            <Alert status="error" borderRadius="md" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" py={10}>
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="xl">Error Fetching Properties!</AlertTitle>
              <AlertDescription maxWidth="sm">{error}</AlertDescription>
            </Alert>
          </Flex>
        )}

        {!loading && !error && properties.length === 0 && (
          <Text textAlign="center" fontSize="lg" color="gray.500" mt={10}>
            No properties found matching your criteria. Try adjusting your filters!
          </Text>
        )}

        {!loading && !error && properties.length === 0 && (
          <Flex flex="1" justify="center" align="center" p={5} minHeight={{ base: "300px", md: "400px" }}>
            <Text textAlign="center" fontSize="xl" color="gray.500">
              No properties found matching your criteria.
              <Text fontSize="md" mt={2}>Try adjusting your filters!</Text>
            </Text>
          </Flex>
        )}

        {/* Property Grid */}
        {!loading && !error && properties.length > 0 && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} width="100%">
            {properties.map(property => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Flex>
  );
};

export default PropertiesPage;