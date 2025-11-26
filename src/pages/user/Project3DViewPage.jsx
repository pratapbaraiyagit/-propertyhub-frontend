// src/pages/user/Project3DViewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Icon,
  Button,
  IconButton,
  useColorModeValue,
  Divider,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiMapPin, FiInfo, FiArrowLeft, FiX, FiMail } from 'react-icons/fi';
import { TimeIcon } from '@chakra-ui/icons';
import UserGLBViewer from '../../components/user/UserGLBViewer';

const MotionBox = motion(Box);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getStatusColor = (status = '') => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'green';
    case 'under construction':
      return 'primary';
    case 'pre-launch':
      return 'yellow';
    default:
      return 'gray';
  }
};

const Project3DViewPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/future-projects/${projectId}`);
        if (!res.ok) throw new Error('Project not found.');
        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const drawerBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  // Responsive values
  const headingSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const textSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const badgeFontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const drawerSize = useBreakpointValue({ base: 'full', md: 'md' });

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bg={pageBg}>
        <Spinner size="xl" thickness="4px" color="primary.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={pageBg} display="flex" justifyContent="center" alignItems="center" p={4}>
        <Alert status="error" maxW="lg" borderRadius="md" boxShadow="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box position="relative" w="100vw" h="100vh" bg={pageBg} overflow="hidden">
      {/* Full-screen 3D Viewer */}
      <MotionBox
        w="100%"
        h="100%"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <UserGLBViewer modelUrl={project?.glbModelUrl} />
      </MotionBox>

      {/* Action Buttons */}
      <Stack
        position="absolute"
        top={4}
        right={4}
        spacing={4}
        zIndex={10}
        direction={{ base: 'column', md: 'row' }}
      >
        <IconButton
          as={RouterLink}
          to="/user/future-projects"
          icon={<FiArrowLeft />}
          aria-label="Back to projects"
          size="lg"
          colorScheme="secondary"
          variant="solid"
          isRound
          boxShadow="md"
          _hover={{ transform: 'scale(1.05)', bg: 'primary.600' }}
          transition="all 0.2s ease"
        />
        <IconButton
          icon={<FiInfo />}
          aria-label="View project details"
          size="lg"
          onClick={onOpen}
          colorScheme="secondary"
          variant="solid"
          isRound
          boxShadow="md"
          _hover={{ transform: 'scale(1.05)', bg: 'primary.600' }}
          transition="all 0.2s ease"
          mr={{ base: 0, md: 6 }}
        />
      </Stack>

      {/* Project Details Drawer */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size={drawerSize}>
        <DrawerOverlay />
        <DrawerContent
          bg={drawerBg}
          backdropFilter="blur(12px)"
          borderLeftWidth="1px"
          boxShadow="xl"
          overflowY="auto"
        >
          <DrawerHeader borderBottomWidth="1px" px={6} py={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Heading size="md" color={textColor}>
                {project.projectName}
              </Heading>
              <IconButton
                icon={<FiX />}
                aria-label="Close"
                onClick={onClose}
                variant="ghost"
                size="lg"
                _hover={{ bg: 'gray.200', transform: 'rotate(90deg)' }}
                transition="all 0.2s ease"
              />
            </Stack>
          </DrawerHeader>

          <DrawerBody p={{ base: 6, md: 8 }}>
            <Stack spacing={6}>
              {/* Status Badge */}
              <Badge
                colorScheme={getStatusColor(project.status)}
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="semibold"
                fontSize={badgeFontSize}
                alignSelf="flex-start"
                boxShadow="sm"
              >
                {project.status}
              </Badge>

              {/* Project Description */}
              <Text fontSize={textSize} color={textColor} lineHeight="tall">
                {project.description}
              </Text>

              <Divider />

              {/* Additional Details */}
              <Stack spacing={4} fontSize={textSize} color={textColor}>
                <Stack direction="row" align="center" spacing={3}>
                  <Icon as={FiMapPin} color="primary.500" boxSize={6} />
                  <Text>
                    <Text as="span" fontWeight="semibold" color={labelColor}>
                      Location:
                    </Text>{' '}
                    {project.location}
                  </Text>
                </Stack>

                <Stack direction="row" align="center" spacing={3}>
                  <Icon as={TimeIcon} color="primary.500" boxSize={6} />
                  <Text>
                    <Text as="span" fontWeight="semibold" color={labelColor}>
                      Expected Completion:
                    </Text>{' '}
                    {project.expectedCompletionDate
                      ? new Date(project.expectedCompletionDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                        })
                      : 'TBD'}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Project3DViewPage;
