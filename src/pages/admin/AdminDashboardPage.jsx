import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

// Import icons for feature cards (Chakra UI doesn't have a huge built-in set, react-icons is great)
// npm install react-icons
import { FaBuilding, FaListAlt, FaUsers, FaChartBar, FaPlusCircle } from 'react-icons/fa'; // Example icons

const FeatureCard = ({ title, description, icon, linkTo }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');

  return (
    <LinkBox
      as="article"
      p={5}
      borderWidth="1px"
      rounded="md"
      boxShadow="md"
      bg={bgColor}
      _hover={{ boxShadow: 'lg', bg: hoverBgColor, transform: 'translateY(-2px)' }}
      transition="all 0.2s ease-in-out"
    >
      <VStack spacing={3} align="flex-start">
        <Flex
          w={12}
          h={12}
          align="center"
          justify="center"
          rounded="full"
          bg={useColorModeValue('green.100', 'green.900')} // Example color
          color={useColorModeValue('green.600', 'green.300')}
        >
          <Icon as={icon} w={6} h={6} />
        </Flex>
        <Heading size="md" fontWeight="semibold">
          <LinkOverlay as={RouterLink} to={linkTo}>
            {title}
          </LinkOverlay>
        </Heading>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          {description}
        </Text>
      </VStack>
    </LinkBox>
  );
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box bg={bgColor} minH="calc(100vh - YOUR_NAVBAR_HEIGHT)" p={{ base: 4, md: 8 }}> {/* Adjust YOUR_NAVBAR_HEIGHT */}
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" color={textColor} mb={2}>
            Admin Dashboard
          </Heading>
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
            Welcome back, {user?.name || user?.email || 'Admin'}!
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <FeatureCard
            title="Manage Properties"
            description="View, add, edit, or delete property listings (houses & existing apartments)."
            icon={FaListAlt}
            linkTo="/admin/properties" 
          />
          <FeatureCard
            title="Manage Future Apartment Projects"
            description="Add, edit, and manage units for upcoming apartment projects."
            icon={FaBuilding}
            linkTo="/admin/future-project" // This is where your existing code might go
          />
          <FeatureCard
            title="Manage Visit Requests"
            description="View and update status of property visit requests from users."
            icon={FaPlusCircle} // Using FaPlusCircle as a placeholder for "requests" or "calendar"
            linkTo="/admin/visit-requests" // TODO: Create this page/route
          />
          <FeatureCard
            title="Manage Auctions"
            description="Oversee property auctions, set parameters, and view bidding activity."
            icon={FaChartBar} // Using FaChartBar as a placeholder for "auctions" or "gavel"
            linkTo="/admin/auctions" // TODO: Create this page/route
          />
          <FeatureCard
            title="Manage Users"
            description="View and manage registered users (bidders, buyers, etc.)."
            icon={FaUsers}
            linkTo="/admin/users"
          />
          {/* Add more feature cards as needed */}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AdminDashboardPage;