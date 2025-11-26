import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Box,
  Flex,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  useColorModeValue,
  Tag,
  HStack,
  Image,
  // Modal components
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader, // Import ModalHeader for better structure
  useDisclosure,
  Tooltip,
  ScaleFade,
  Button,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FiTag, FiLayout, FiCheckSquare, FiGrid, FiZoomIn, FiMail } from 'react-icons/fi';

// Import the InquiryForm component - adjust path as necessary for your project structure
import InquiryForm from '../user/InquiryForm'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ProjectUnitsPage = () => {
  const { projectId } = useParams();
  const [units, setUnits] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State and disclosure for the Floor Plan Modal
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();
  
  // State and disclosure for the Inquiry Form Modal
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { isOpen: isInquiryModalOpen, onOpen: onInquiryModalOpen, onClose: onInquiryModalClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchProjectAndUnits = async () => {
      if (!projectId) return;
      setLoading(true);
      setError('');
      try {
        const projectRes = await fetch(`${API_BASE_URL}/api/future-projects/${projectId}`);
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
        } else {
          throw new Error('Could not fetch project details.');
        }
        const unitsRes = await fetch(`${API_BASE_URL}/api/future-projects/${projectId}/units`);
        if (!unitsRes.ok) throw new Error('Could not fetch units for this project.');
        const unitsData = await unitsRes.json();
        setUnits(unitsData);
      } catch (e) {
        setError(e.message || 'An unexpected error occurred.');
        setProject(null);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndUnits();
  }, [projectId]);

  // Handler for opening the floor plan image modal
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    onImageModalOpen();
  };

  // Handler for opening the inquiry modal
  const handleInquiryClick = (unitId, unitTypeName) => {
    setSelectedUnit({ id: unitId, name: unitTypeName });
    onInquiryModalOpen();
  };
  
  // Handler for closing the modal after successful submission
  const handleInquirySuccess = () => {
    // Closes the modal and resets the selected unit state
    onInquiryModalClose(); 
    setSelectedUnit(null);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container py={10} maxW="container.lg">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={{ base: 10, md: 16 }}>
      {/* Breadcrumb Section */}
      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/user/future-projects" color={textColor}>Future Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#" color={headingColor} fontWeight="bold">{project?.projectName || 'Project Units'}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <VStack spacing={3} mt={6} mb={10} align="start">
        <Heading as="h1" size="xl" color={headingColor}>Available Unit Types in {project?.projectName || 'this Project'}</Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color={textColor}>
          Discover the various unit types, their layouts, and availability.
        </Text>
      </VStack>

      {/* Units Grid */}
      {units.length === 0 ? (
        <Box textAlign="center" py={20} px={6} bg={cardBg} borderRadius="lg" shadow="md">
          <Icon as={FiGrid} boxSize={'60px'} color={'primary.400'} mb={4} />
          <Heading as="h2" size="xl" mt={6} mb={2} color={headingColor}>No Units Listed Yet</Heading>
          <Text color={'gray.500'} fontSize="lg">
            Details for unit types in this project are still being prepared. Please check back later!
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {units.map((unit) => (
              <Box
                key={unit._id}
                shadow="md"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                bg={cardBg}
                overflow="hidden"
                transition="all 0.2s ease-in-out"
                _hover={{
                  shadow: "lg",
                  transform: "translateY(-5px)",
                  bg: hoverBg,
                }}
              >
                {/* Floor Plan Image Section */}
                <Tooltip label="Click to view floor plan" aria-label="View floor plan" hasArrow>
                  <Box position="relative" w="100%" h="250px" overflow="hidden">
                    <Image
                      src={unit.floorPlanImageUrl}
                      alt={`Floor plan for ${unit.unitTypeName}`}
                      fallbackSrc={'https://via.placeholder.com/600x400?text=Floor+Plan+Not+Available'}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      cursor="pointer"
                      onClick={() => handleImageClick(unit.floorPlanImageUrl)}
                      transition="transform 0.3s ease-in-out"
                      _hover={{ transform: "scale(1.05)" }}
                    />
                    <Flex
                      position="absolute"
                      bottom="0"
                      right="0"
                      bg="rgba(0,0,0,0.6)"
                      color="white"
                      px={3}
                      py={2}
                      borderRadius="tl-lg"
                      align="center"
                      fontSize="sm"
                    >
                      <Icon as={FiZoomIn} mr={1} /> View
                    </Flex>
                  </Box>
                </Tooltip>

                {/* Unit Details and Inquiry Button */}
                <Box p={5}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading fontSize="xl" color={headingColor}>{unit.unitTypeName}</Heading>
                    <Tag
                      colorScheme={unit.availableUnits > 0 ? 'green' : 'red'}
                      size="md"
                      variant="solid"
                    >
                      {unit.availableUnits > 0 ? `${unit.availableUnits} Available` : 'Sold Out'}
                    </Tag>
                  </Flex>
                  <Text fontSize="sm" color={textColor} mt={1} noOfLines={2}>
                    {unit.description || 'No detailed description available for this unit type.'}
                  </Text>
                  <VStack align="start" mt={4} spacing={3} color={textColor} mb={6}>
                    <HStack>
                      <Icon as={FiTag} w={5} h={5} color="primary.500" />
                      <Text><strong>Price:</strong> {unit.estimatedPriceRange || 'Contact for pricing'}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiLayout} w={5} h={5} color="primary.500" />
                      <Text><strong>Area:</strong> {unit.areaSqft ? `${unit.areaSqft} sqft` : 'N/A'}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckSquare} w={5} h={5} color="primary.500" />
                      <Text><strong>Layout:</strong> {unit.bedrooms || 'N/A'} Bed, {unit.bathrooms || 'N/A'} Bath</Text>
                    </HStack>
                  </VStack>
                  
                  {/* Inquiry Button - Triggers the modal open */}
                  <Button
                    onClick={() => handleInquiryClick(unit._id, unit.unitTypeName)}
                    colorScheme="secondary"
                    size="md"
                    width="100%"
                    leftIcon={<FiMail />}
                  >
                    {unit.availableUnits > 0 ? 'Express Interest' : 'Join Waitlist'}
                  </Button>
                </Box>
              </Box>
          ))}
        </SimpleGrid>
      )}

      {/* 1. Floor Plan Image Modal */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="3xl" isCentered motionPreset="scale">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          maxW={{ base: "90vw", md: "80vw", lg: "70vw" }}
          bg="transparent"
          shadow="none"
          borderRadius="none"
          p={0}
        >
          <ModalCloseButton
            color="white"
            fontSize="lg"
            top={4}
            right={4}
            zIndex={1}
            _hover={{ bg: "whiteAlpha.300" }}
          />
          <ModalBody p={0}>
            <ScaleFade initialScale={0.9} in={isImageModalOpen}>
              <Image
                src={selectedImageUrl}
                alt="Enlarged Floor Plan"
                objectFit="contain"
                w="100%"
                h="auto"
                maxH="90vh"
                borderRadius="md"
                shadow="dark-lg"
              />
            </ScaleFade>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 2. Inquiry Form Modal */}
      <Modal isOpen={isInquiryModalOpen} onClose={onInquiryModalClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {/* Only render the form if a unit is selected */}
            {selectedUnit && (
              <InquiryForm
                projectId={projectId}
                unitTitle={selectedUnit.name}
                onFormSubmitSuccess={handleInquirySuccess}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProjectUnitsPage;