import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  SimpleGrid,
  Box,
  Image,
} from '@chakra-ui/react';

const ApartmentUnitForm = ({ isOpen, onClose, onSave, initialData, projectId }) => {
  const [formData, setFormData] = useState({});
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultData = {
        unitTypeName: '',
        bedrooms: 1,
        bathrooms: 1,
        areaSqft: '',
        estimatedPriceRange: '',
        description: '',
        totalUnits: '',
        availableUnits: '',
        features: '',
        floorPlanImageUrl: '',
        projectId,
      };
      const currentData = initialData
        ? {
            ...defaultData,
            ...initialData,
            features: initialData.features?.join(', ') || '',
          }
        : defaultData;
      setFormData(currentData);
      setFloorPlanPreview(currentData.floorPlanImageUrl || '');
      setFloorPlanFile(null);
    }
  }, [initialData, isOpen, projectId]);

  const handleFloorPlanFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFloorPlanFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFloorPlanPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFloorPlanFile(null);
      setFloorPlanPreview('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, _, valueAsNumber) => {
    setFormData((prev) => ({ ...prev, [name]: valueAsNumber }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const dataToSave = {
      ...formData,
      features: formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter((f) => f)
        : [],
      bedrooms: parseInt(formData.bedrooms, 10) || 0,
      bathrooms: parseFloat(formData.bathrooms) || 0,
      areaSqft: parseInt(formData.areaSqft, 10) || 0,
      totalUnits: parseInt(formData.totalUnits, 10) || 0,
      availableUnits: parseInt(formData.availableUnits, 10) || 0,
    };
    await onSave(dataToSave, floorPlanFile);
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}> {/* Changed size here */}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialData?._id ? 'Edit Apartment Unit' : 'Add New Apartment Unit'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Unit Type Name</FormLabel>
              <Input
                name="unitTypeName"
                value={formData.unitTypeName || ''}
                onChange={handleChange}
                placeholder="e.g., Type A - 2 Bedroom"
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> {/* Changed columns here */}
              <FormControl isRequired>
                <FormLabel>Bedrooms</FormLabel>
                <NumberInput
                  name="bedrooms"
                  min={0}
                  value={formData.bedrooms || 0}
                  onChange={(str, num) => handleNumberChange('bedrooms', str, num)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Bathrooms</FormLabel>
                <NumberInput
                  name="bathrooms"
                  step={0.5}
                  min={0}
                  value={formData.bathrooms || 0}
                  onChange={(str, num) => handleNumberChange('bathrooms', str, num)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Area (sq ft / sq m)</FormLabel>
              <NumberInput
                name="areaSqft"
                min={0}
                value={formData.areaSqft || ''}
                onChange={(str, num) => handleNumberChange('areaSqft', str, num)}
              >
                <NumberInputField placeholder="e.g., 1200" />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Estimated Price Range</FormLabel>
              <Input
                name="estimatedPriceRange"
                value={formData.estimatedPriceRange || ''}
                onChange={handleChange}
                placeholder="e.g., $450,000 - $500,000"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> {/* Changed columns here */}
              <FormControl>
                <FormLabel>Total Units of this Type</FormLabel>
                <NumberInput
                  name="totalUnits"
                  min={0}
                  value={formData.totalUnits || ''}
                  onChange={(str, num) => handleNumberChange('totalUnits', str, num)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Available Units</FormLabel>
                <NumberInput
                  name="availableUnits"
                  min={0}
                  value={formData.availableUnits || ''}
                  onChange={(str, num) => handleNumberChange('availableUnits', str, num)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Features (comma-separated)</FormLabel>
              <Input
                name="features"
                value={formData.features || ''}
                onChange={handleChange}
                placeholder="e.g., Balcony, Smart Home, Ocean View"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Floor Plan Image (Optional)</FormLabel>
              <Input
                type="file"
                name="floorPlanImageFile"
                accept="image/*"
                onChange={handleFloorPlanFileChange}
                p={1.5}
              />
              {floorPlanPreview && (
                <Box mt={2} borderWidth="1px" borderRadius="md" p={1} width="fit-content">
                  <Image
                    src={floorPlanPreview}
                    alt="Floor plan preview"
                    boxSize="150px"
                    objectFit="contain"
                  />
                </Box>
              )}
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="secondary"
            onClick={handleSubmit}
            isLoading={isSaving}
            loadingText={initialData?._id ? 'Updating...' : 'Adding...'}
          >
            {initialData?._id ? 'Update Unit' : 'Add Unit'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApartmentUnitForm;