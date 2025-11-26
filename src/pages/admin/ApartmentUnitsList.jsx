import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  HStack,
  useToast,
  Flex,
  useBreakpointValue, // Import useBreakpointValue
  VStack, // Import VStack for stacked cards
  Card, // Import Card component
  CardBody, // Import CardBody
  StackDivider, // Import StackDivider
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import ApartmentUnitForm from './ApartmentUnitForm';
import axios from '../../api/axiosInstance';


const ApartmentUnitsList = ({ projectId }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Determine if we should show the table or stacked cards based on breakpoint
  const isMobile = useBreakpointValue({ base: true, md: false });

  const loadUnits = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
     const response = await axios.get(`/future-projects/${projectId}/units`);
    setUnits(response.data);
  } catch (e) {
    // Use standard axios error handling
    setError('Failed to load apartment units.');
    console.error(e);
  } finally {
    setLoading(false);
  }
  }, [projectId]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleAddUnit = () => {
    setSelectedUnit(null);
    onOpen();
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    onOpen();
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    try {
      await axios.delete(`/admin/future-projects/${projectId}/units/${unitId}`);

      toast({
        title: 'Unit Deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      loadUnits();
    } catch (e)  {
      toast({
        title: 'Error Deleting Unit',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleSaveUnit = async (unitDataFromForm, floorPlanFile) => {
    const isEditing = !!unitDataFromForm._id;
  let unitId = unitDataFromForm._id;
  
  const payload = { ...unitDataFromForm };
  if (!isEditing) delete payload._id;

    try {
    let savedUnitData;

    if (isEditing) {
      // --- UPDATE (PUT) LOGIC ---
      const response = await axios.put(`/admin/future-projects/${projectId}/units/${unitId}`, payload);
      savedUnitData = response.data;
    } else {
      // --- CREATE (POST) LOGIC ---
      const response = await axios.post(`/admin/future-projects/${projectId}/units`, payload);
      savedUnitData = response.data;
    }

    // After saving text, get the ID and upload the image if it exists
    unitId = savedUnitData._id;
    if (floorPlanFile && unitId) {
      const imageFormData = new FormData();
      imageFormData.append('floorPlanImage', floorPlanFile);

      // Axios handles the multipart/form-data header automatically
      await axios.post(`/admin/future-projects/${projectId}/units/${unitId}/upload-floorplan`, imageFormData);
    }
      toast({
        title: isEditing ? 'Unit Updated' : 'Unit Added',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      onClose();
      loadUnits();
    } catch (e) {
      toast({
        title: 'Error Saving Unit',
        description: e.message || 'Could not save unit details.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="200px">
        <Spinner size="lg" />
        <Text ml={3}>Loading units...</Text>
      </Flex>
    );
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }

  return (
    <Box p={{ base: 4, md: 6 }}> {/* Add padding for smaller screens */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} direction={{ base: 'column', md: 'row' }}> {/* Stack on mobile */}
        <Heading size={{ base: 'md', md: 'lg' }} mb={{ base: 4, md: 0 }}>Apartment Units / Types</Heading> {/* Adjust heading size */}
        <Button leftIcon={<AddIcon />} colorScheme="secondary" onClick={handleAddUnit} width={{ base: '100%', md: 'auto' }}> {/* Full width on mobile */}
          Add New Unit Type
        </Button>
      </Flex>

      {units.length === 0 ? (
        <Text>No apartment units added yet for this project.</Text>
      ) : (
        <>
          {isMobile ? (
            // Mobile view: Stacked cards
            <VStack spacing={4} align="stretch">
              {units.map((unit) => (
                <Card key={unit._id} variant="outline">
                  <CardBody>
                    <VStack divider={<StackDivider />} spacing={2} align="stretch">
                      <HStack justifyContent="space-between">
                        <Text fontWeight="bold">Type:</Text>
                        <Text>{unit.unitTypeName}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="bold">Beds:</Text>
                        <Text>{unit.bedrooms}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="bold">Price:</Text>
                        <Text>{unit.estimatedPriceRange}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="bold">Total Units:</Text>
                        <Text>{unit.totalUnits}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="bold">Available:</Text>
                        <Text>{unit.availableUnits}</Text>
                      </HStack>
                      <HStack justifyContent="flex-end" pt={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          aria-label="Edit Unit"
                          onClick={() => handleEditUnit(unit)}
                          colorScheme="blue"
                          variant="outline"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          aria-label="Delete Unit"
                          onClick={() => handleDeleteUnit(unit._id)}
                          colorScheme="red"
                          variant="outline"
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            // Desktop/Tablet view: Table
            <Box overflowX="auto"> {/* Ensure table is scrollable if it overflows on wider screens */}
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Unit Type Name</Th>
                    <Th>Bedrooms</Th>
                    <Th>Price Range</Th>
                    <Th isNumeric display={{ base: 'none', lg: 'table-cell' }}>Total</Th> {/* Hide on medium, show on large */}
                    <Th isNumeric display={{ base: 'none', lg: 'table-cell' }}>Available</Th> {/* Hide on medium, show on large */}
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {units.map((unit) => (
                    <Tr key={unit._id}>
                      <Td>{unit.unitTypeName}</Td>
                      <Td>{unit.bedrooms}</Td>
                      <Td>{unit.estimatedPriceRange}</Td>
                      <Td isNumeric display={{ base: 'none', lg: 'table-cell' }}>{unit.totalUnits}</Td>
                      <Td isNumeric display={{ base: 'none', lg: 'table-cell' }}>{unit.availableUnits}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            aria-label="Edit Unit"
                            onClick={() => handleEditUnit(unit)}
                            colorScheme="blue"
                            variant="outline"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            aria-label="Delete Unit"
                            onClick={() => handleDeleteUnit(unit._id)}
                            colorScheme="red"
                            variant="outline"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      )}

      <ApartmentUnitForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveUnit}
        initialData={selectedUnit}
        projectId={projectId}
      />
    </Box>
  );
};

export default ApartmentUnitsList;