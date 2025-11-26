// src/pages/admin/FutureProjectDetailsPage.jsx
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
  VStack,
  Text,
  Badge,
  Icon,
  HStack,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useBreakpointValue,
  Link, // Added for breadcrumbs
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  EditIcon,
  DeleteIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  CalendarIcon,
  ChevronRightIcon, // Added for breadcrumbs
} from '@chakra-ui/icons';
import { FaMapMarkerAlt, FaBuilding, FaDollarSign, FaRulerCombined, FaCalendarDay } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectDetailsForm from './ProjectDetailsForm';
import UserGLBViewer from '../../components/admin/AdminGLBViewer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const FutureProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'full', sm: 'md', md: 'xl' });

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/future-projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project details.');
      const data = await res.json();
      setProject(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleUpdateProject = async (updatedData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/future-projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update project');
      }
      toast({
        title: 'Project updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      onClose();
      fetchProjectDetails();
    } catch (e) {
      toast({
        title: 'Error updating project',
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

  const handleDeleteProject = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/future-projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete project');
      }
      toast({
        title: 'Project deleted successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/admin/dashboard');
    } catch (e) {
      toast({
        title: 'Error deleting project',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const getStatusProps = (status) => {
    switch (status?.toLowerCase()) {
      case 'planning':
        return { colorScheme: 'blue', icon: TimeIcon };
      case 'under construction':
        return { colorScheme: 'orange', icon: WarningIcon };
      case 'completed':
        return { colorScheme: 'green', icon: CheckCircleIcon };
      default:
        return { colorScheme: 'gray', icon: WarningIcon };
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.600" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading Project Details...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => navigate('/admin/future-projects')}>Back to Projects</Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Project not found.
        </Alert>
        <Button mt={4} onClick={() => navigate('/admin/future-projects')}>Back to Projects</Button>
      </Box>
    );
  }

  const statusProps = getStatusProps(project.status);

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {/* Breadcrumbs and "Back to Dashboard" button */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
        <HStack spacing={1} fontSize="sm" color="gray.500">
          <Link onClick={() => navigate("/admin/dashboard")} _hover={{ textDecoration: 'underline', color: 'primary.500' }}>Admin Home</Link>
          <ChevronRightIcon />
          <Link onClick={() => navigate("/admin/future-projects")} _hover={{ textDecoration: 'underline', color: 'primary.500' }}>Future projects</Link>
          <ChevronRightIcon />
          <Text fontWeight="semibold" color="gray.700">{project.projectName}</Text>
        </HStack>
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/future-project")} variant="ghost" size={buttonSize}>
          Back to Dashboard
        </Button>
      </Flex>

      <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="lg" boxShadow="lg" borderWidth="1px" borderColor="gray.200">
        <Flex justifyContent="space-between" alignItems="flex-start" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Flex alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <Heading as="h1" size={headingSize} fontWeight="bold" color="gray.800">
                {project.projectName}
              </Heading>
              <Badge
                colorScheme={statusProps.colorScheme}
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
                fontSize={{ base: 'sm', md: 'md' }}
              >
                <Icon as={statusProps.icon} mr={1} />
                {project.status}
              </Badge>
            </Flex>
            <Text color="gray.600" lineHeight="tall" maxWidth="800px"> {/* Added maxWidth */}
              {project.description}
            </Text>
          </Box>
          <Flex gap={2} flexWrap="wrap">
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              onClick={onOpen}
              size={buttonSize}
            >
              Edit Project
            </Button>
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              onClick={handleDeleteProject}
              size={buttonSize}
            >
              Delete Project
            </Button>
          </Flex>
        </Flex>

        {/* 3D Model Viewer */}
        {project.glbModelUrl ? (
          <Box mb={6} borderRadius="md" overflow="hidden" boxShadow="md" bg="gray.100"> {/* Added Box for styling */}
            <UserGLBViewer modelUrl={project.glbModelUrl} />
          </Box>
        ) : (
          <Flex
            w="100%"
            h="400px"
            bg="gray.100"
            borderRadius="md"
            justify="center"
            align="center"
            p={4}
            mb={6}
            boxShadow="md" // Added boxShadow
          >
            <Text color="gray.500" fontWeight="semibold" textAlign="center">
              No 3D model available for this project.
            </Text>
          </Flex>
        )}
        
        <VStack spacing={5} align="stretch" fontSize={{ base: 'sm', md: 'md' }} mt={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
            <HStack align="flex-start"> {/* Align icons and text correctly */}
              <Icon as={FaMapMarkerAlt} color="primary.500" boxSize={5} mt={1} /> {/* Adjusted boxSize and mt */}
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="semibold" color="gray.700">Location</Text>
                <Text color="gray.600">{project.location}</Text>
              </VStack>
            </HStack>
            <HStack align="flex-start">
              <Icon as={CalendarIcon} color="primary.500" boxSize={5} mt={1} />
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="semibold" color="gray.700">Completion Date</Text>
                <Text color="gray.600">
                  {project.expectedCompletionDate
                    ? new Date(project.expectedCompletionDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </VStack>
            </HStack>
            <HStack align="flex-start">
              <Icon as={FaCalendarDay} color="primary.500" boxSize={5} mt={1} />
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="semibold" color="gray.700">Expected Completion Date</Text>
                <Text color="gray.600">{project.expectedCompletionDate}</Text>
              </VStack>
            </HStack>
          </SimpleGrid>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProjectDetailsForm
              initialData={project}
              onSave={handleUpdateProject}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FutureProjectDetailsPage;