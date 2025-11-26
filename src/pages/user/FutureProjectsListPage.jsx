import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Flex,
  Icon,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  Spacer,
  Button,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { FiMapPin, FiBox, FiGrid } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const FutureProjectsListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/future-projects`);
        if (!res.ok) {
          throw new Error('Network response was not ok. Could not fetch projects.');
        }
        const data = await res.json();
        setProjects(data.filter(p => p.glbModelUrl));
      } catch (e) {
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('primary.500', 'primary.300');
  const buttonColorScheme = 'primary';

  if (loading) { return <Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>; }
  if (error) { return <Container py={10}><Alert status="error"><AlertIcon />{error}</Alert></Container>; }

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 8 }}>
      <VStack spacing={3} mb={{ base: 10, md: 14 }} textAlign="center">
        {/* Responsive Heading Size */}
        <Heading as="h1" size="xl" textAlign="center">Explore Our Future Projects</Heading>
        {/* Responsive Text Size */}
        <Text fontSize={{ base: "md", md: "lg" }} color={textColor} maxW="2xl">Step into tomorrow with our interactive 3D models.</Text>
      </VStack>

      {projects.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Icon as={FiBox} boxSize={{ base: '40px', md: '50px' }} color={accentColor} />
          <Heading as="h2" size={{ base: "lg", md: "xl" }} mt={6} mb={2}>No 3D Models Available</Heading>
          <Text color={'gray.500'} fontSize={{ base: "md", md: "lg" }}>Please check back soon!</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }}>
          {projects.map((project) => (
              <LinkBox
                key={project._id}
                as="article"
                bg={cardBg}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                _hover={{ transform: 'translateY(-8px) scale(1.02)', boxShadow: '2xl' }}
                display="flex"
                flexDirection="column"
                // Added responsive padding for better spacing on smaller screens
                p={{ base: 4, md: 0 }} // p={0} for md to let VStack handle internal padding
              >
                <Box overflow="hidden">
                  <Image
                    src={project.coverImageUrl}
                    alt={`Cover image for ${project.projectName}`}
                    objectFit="cover"
                    w="100%"
                    h={{ base: "180px", md: "220px" }} // Responsive image height
                    fallbackSrc={'https://via.placeholder.com/400x300?text=Project+Image'}
                  />
                </Box>
                <VStack spacing={4} align="stretch" p={{ base: 4, md: 6 }} flexGrow={1}> {/* Responsive VStack padding */}
                  <Heading as="h3" size={{ base: "sm", md: "md" }} fontWeight="semibold"> {/* Responsive Heading size */}
                    <LinkOverlay as={RouterLink} to={`/future-projects/${project._id}/view-3d`}>{project.projectName}</LinkOverlay>
                  </Heading>
                  <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>Luxury Apartment</Text> {/* Responsive Text size */}
                  <HStack color={textColor} fontSize={{ base: "xs", md: "sm" }}> {/* Responsive Text size */}
                    <Icon as={FiMapPin} /><Text>{project.location}</Text>
                  </HStack>
                  <Spacer />
                  <Flex
                    direction={{ base: "column", md: "row" }} // Stack buttons vertically on small screens
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }} // Stretch buttons on small screens
                    mt={4}
                    gap={2} // Add gap between buttons on small screens
                  >
                    <Button
                      as={RouterLink}
                      to={`/future-projects/${project._id}/view-3d`}
                      variant="ghost"
                      colorScheme={buttonColorScheme}
                      rightIcon={<ArrowForwardIcon />}
                      width={{ base: "100%", md: "auto" }} // Full width on small screens
                    >
                      View 3D Model
                    </Button>
                    <Button
                      as={RouterLink}
                      to={`/future-projects/${project._id}/units`}
                      variant="solid"
                      colorScheme={buttonColorScheme}
                      leftIcon={<FiGrid />}
                      width={{ base: "100%", md: "auto" }} // Full width on small screens
                    >
                      View Units
                    </Button>
                  </Flex>
                </VStack>
              </LinkBox>
            )
          )}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default FutureProjectsListPage;