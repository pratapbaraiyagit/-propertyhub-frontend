// src/pages/admin/FutureProjectAdminPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Button,
  Tag,
  HStack,
  Text,
  VStack,
  Grid,
  GridItem,
  Icon,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  AddIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  CalendarIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons';
import { FaMapMarkerAlt, FaBuilding, FaThList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import ProjectDetailsForm from './ProjectDetailsForm';
import ApartmentUnitsList from './ApartmentUnitsList';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Small helper for displaying icons with text
const ProjectDetail = ({ icon, children, ...props }) => {
  const textSize = useBreakpointValue({ base: 'xs', md: 'sm' });
  const iconSize = useBreakpointValue({ base: '0.8em', md: '1em' });

  return (
    <HStack spacing={2} alignItems="center" {...props}>
      <Icon as={icon} color="gray.500" boxSize={iconSize} />
      <Text fontSize={textSize} color="gray.700">
        {children}
      </Text>
    </HStack>
  );
};

const ProjectCard = ({ project, onManageUnits, navigateToDetails }) => {
  const getStatusProps = (status) => {
    switch (status?.toLowerCase()) {
      case 'planning':
        return { colorScheme: 'blue', icon: TimeIcon };
      case 'under construction':
        return { colorScheme: 'orange', icon: WarningIcon };
      case 'completed':
        return { colorScheme: 'green', icon: CheckCircleIcon };
      default:
        return { colorScheme: 'gray', icon: InfoOutlineIcon };
    }
  };
  const statusProps = getStatusProps(project.status);

  // Responsive values for card elements
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const tagSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const cardPadding = useBreakpointValue({ base: 4, md: 5 });
  const actionButtonGap = useBreakpointValue({ base: 1, md: 2 });
  const actionButtonDirection = useBreakpointValue({ base: 'column', md: 'row' });


  return (
    <GridItem>
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: 'md', transform: 'translateY(-3px)' }}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <Box p={cardPadding}>
          <Heading size={headingSize} noOfLines={2} mb={2}>
            {project.projectName}
          </Heading>
          <Tag size={tagSize} colorScheme={statusProps.colorScheme} variant="subtle">
            <Icon as={statusProps.icon} mr={2} />
            {project.status}
          </Tag>
        </Box>

        <Divider />

        <VStack p={cardPadding} spacing={3} alignItems="flex-start" flexGrow={1}>
          <ProjectDetail icon={FaMapMarkerAlt}>{project.location}</ProjectDetail>
          <ProjectDetail icon={CalendarIcon}>
            {project.expectedCompletionDate
              ? `Est. Completion: ${new Date(
                  project.expectedCompletionDate
                ).toLocaleDateString()}`
              : 'Est. Completion: N/A'}
          </ProjectDetail>
        </VStack>

        <Divider />

        {/* Action Buttons */}
        <Flex
          justify="space-between"
          p={cardPadding}
          bg="gray.50"
          borderTopWidth="1px"
          borderColor="gray.200"
          gap={actionButtonGap}
          direction={actionButtonDirection}
        >
          {/* Updated onClick to use navigateToDetails prop */}
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigateToDetails(project._id)} 
            size={buttonSize}
            w={{ base: 'full', md: 'auto' }}
          >
            View Details
          </Button>
          <Button
            colorScheme="secondary"
            leftIcon={<Icon as={FaThList} />}
            onClick={() => onManageUnits(project._id)}
            size={buttonSize}
            w={{ base: 'full', md: 'auto' }}
          >
            Manage Units
          </Button>
        </Flex>
      </Box>
    </GridItem>
  );
};

const FutureProjectAdminPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/future-projects`);
      if (!res.ok) throw new Error('Failed to fetch projects from the server.');
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/future-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add project');
      }
      toast({
        title: 'Project added successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setIsAddingProject(false);
      fetchProjects();
    } catch (e) {
      toast({
        title: 'Error adding project',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToDetails = (projectId) => {
    navigate(`/admin/future-projects/${projectId}`);
  };


  // Responsive values for main page
  const pagePadding = useBreakpointValue({ base: 4, md: 8 });
  const mainHeadingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const subHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const headerDirection = useBreakpointValue({ base: 'column', md: 'row' });
  const headerAlignItems = useBreakpointValue({ base: 'flex-start', md: 'center' });
  const headerGap = useBreakpointValue({ base: 4, md: 0 });


  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="60vh" p={pagePadding}>
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.600" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading Projects...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={pagePadding}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  // VIEW 1: Add New Project
  if (isAddingProject) {
    return (
      <Box p={pagePadding}>
        <Flex
          justifyContent="space-between"
          alignItems={headerAlignItems}
          mb={8}
          direction={headerDirection}
          gap={headerGap}
        >
          <Heading size={mainHeadingSize} color="gray.800">Add New Apartment Project</Heading>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => setIsAddingProject(false)} variant="outline" size={buttonSize} w={{ base: 'full', md: 'auto' }}>
            Back to Dashboard
          </Button>
        </Flex>
        <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="lg" boxShadow="sm">
          <ProjectDetailsForm
            onSave={handleAddProject}
            isLoading={isSubmitting}
            submitButtonText="Create Project"
          />
        </Box>
      </Box>
    );
  }

  // NOTE: The entire Edit functionality from this page is removed, as it will be on the new details page.

  // VIEW 2: Manage Units
  if (selectedProjectId && selectedProject) {
    return (
      <Box p={pagePadding}>
        <Flex
          justifyContent="space-between"
          alignItems={headerAlignItems}
          mb={8}
          direction={headerDirection}
          gap={headerGap}
        >
          <Box>
            <Heading size={mainHeadingSize} color="gray.800">Manage Apartment Units</Heading>
            <Text color="gray.600" mt={1} fontSize={{ base: 'sm', md: 'md' }}>
              For Project:{' '}
              <Text as="span" fontWeight="bold">{selectedProject.projectName}</Text>
            </Text>
          </Box>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => setSelectedProjectId('')} variant="outline" size={buttonSize} w={{ base: 'full', md: 'auto' }}>
            Back to All Projects
          </Button>
        </Flex>
        <ApartmentUnitsList projectId={selectedProjectId} />
      </Box>
    );
  }

  // VIEW 3: Main Dashboard
  return (
    <Box p={pagePadding} bg="gray.50" minH="100vh">
      <Flex
        justifyContent="space-between"
        alignItems={headerAlignItems}
        mb={8}
        direction={headerDirection}
        gap={headerGap}
      >
        <Heading size={mainHeadingSize} color="gray.800">Future Projects Dashboard</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="secondary"
          onClick={() => setIsAddingProject(true)}
          boxShadow="md"
          size={buttonSize}
          w={{ base: 'full', md: 'auto' }}
        >
          New Project
        </Button>
      </Flex>

      {/* Grid or Empty State */}
      {projects.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={{ base: 6, md: 10 }}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          textAlign="center"
          minH="40vh"
          border="2px dashed"
          borderColor="gray.200"
        >
          <Icon as={FaBuilding} boxSize={{ base: '40px', md: '50px' }} color="primary.300" />
          <Heading size={subHeadingSize} mt={4} mb={2}>No Projects Found</Heading>
          <Text color="gray.500" mb={6} fontSize={{ base: 'sm', md: 'md' }}>
            Get started by adding your first future apartment project.
          </Text>
          <Button colorScheme="secondary" onClick={() => setIsAddingProject(true)} size={buttonSize}>
            Add Your First Project
          </Button>
        </Flex>
      ) : (
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onManageUnits={setSelectedProjectId}
              navigateToDetails={handleNavigateToDetails}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FutureProjectAdminPage;