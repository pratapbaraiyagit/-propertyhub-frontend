// src/components/admin/PropertyForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Stack,
  Heading,
  SimpleGrid,
  useToast,
  HStack,
  InputGroup,
  InputRightAddon,
  RadioGroup,
  Radio,
  Image, // Import Image for previews
  Text as ChakraText
} from '@chakra-ui/react';
import { sriLankanDistricts } from '../utils/constants'; // Import the districts constant

const PropertyForm = ({ initialData, onSubmit, isLoading, submitButtonText = "Save Property" }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    district: '', // <<<< ADDED district field
    area: '',
    bedrooms: 1,
    propertyType: 'house',
    status: 'for sale',
  });
  const [imageFiles, setImageFiles] = useState([]); // Separate state for new files
  const [existingImageUrls, setExistingImageUrls] = useState([]); // For edit mode

  const [isAuction, setIsAuction] = useState('no');
  const [auctionData, setAuctionData] = useState({
    startingPrice: '',
    startTime: '', // Storing full datetime string
    endTime: ''
  });
  const toast = useToast();
  const fileInputRef = useRef();

  useEffect(() => {
    const defaultState = {
      title: '', description: '', price: '', addressLine1: '', addressLine2: '', addressLine3: '', district: '',
      area: '', bedrooms: 1, propertyType: 'house', status: 'for sale',
    };
    if (initialData) {
      // Map backend 'address' to frontend 'addressLine1' if present
      const mappedData = { ...defaultState, ...initialData };
      if (initialData.address) {
        mappedData.addressLine1 = initialData.address;
      }
      setFormData(mappedData);
      setExistingImageUrls(initialData.imageUrls || []);
      setIsAuction(initialData.auction ? 'yes' : 'no');
      if (initialData.auction) {
        setAuctionData({
          startingPrice: initialData.auction.startingPrice || '',
          // Format Date objects back to datetime-local string format for input value
          startTime: initialData.auction.startTime ? new Date(initialData.auction.startTime).toISOString().slice(0, 16) : '',
          endTime: initialData.auction.endTime ? new Date(initialData.auction.endTime).toISOString().slice(0, 16) : '',
        });
      }
    } else {
      // Reset form for "Add New"
      setFormData(defaultState);
      setExistingImageUrls([]);
      setImageFiles([]);
      setIsAuction('no');
      setAuctionData({ startingPrice: '', startTime: '', endTime: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, valueAsString) => {
    setFormData(prev => ({ ...prev, [name]: valueAsString }));
  };

  const handleImageFilesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleAuctionChange = (e) => {
    setAuctionData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.addressLine1 || !formData.district) {
      toast({
        title: "Missing Fields",
        description: "Title, Price, Address, and District are required.",
        status: "error",
      });
      return;
    }
onSubmit({
        propertyData: formData, // The main form state
        auctionData: auctionData,
        isAuction: isAuction,
        imageFiles: imageFiles, // The array of new file objects
        existingImageUrls: existingImageUrls // The array of old image URLs to keep
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" p={6} borderRadius="lg" boxShadow="base">
      <Stack spacing={5}>
        <Heading size="lg" mb={2}>{initialData?._id ? "Edit Property Details" : "Add New Property"}</Heading>

        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input name="title" value={formData.title} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Address</FormLabel>
          <Stack spacing={2}>
            <Input placeholder="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
            <Input placeholder="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
            <Input placeholder="City" name="addressLine3" value={formData.addressLine3} onChange={handleChange} />
          </Stack>
        </FormControl>
        
        {/* --- NEWLY ADDED DISTRICT FIELD --- */}
        <FormControl isRequired>
            <FormLabel>District</FormLabel>
            <Select
                name="district"
                placeholder="Select a district"
                value={formData.district}
                onChange={handleChange}
            >
                {sriLankanDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                ))}
            </Select>
        </FormControl>
        {/* --- END OF NEW FIELD --- */}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Price (LKR)</FormLabel>
            <NumberInput min={0} value={formData.price} onChange={(val) => handleNumberChange('price', val)}>
                <NumberInputField name="price" />
            </NumberInput>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Area (sq ft)</FormLabel>
             <NumberInput min={0} value={formData.area} onChange={(val) => handleNumberChange('area', val)}>
              <NumberInputField name="area"/>
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Bedrooms</FormLabel>
            <NumberInput min={0} value={formData.bedrooms} onChange={(val) => handleNumberChange('bedrooms', val)}>
              <NumberInputField name="bedrooms" />
            </NumberInput>
          </FormControl>
           <FormControl isRequired>
            <FormLabel>Bathrooms</FormLabel>
            <NumberInput min={0} value={formData.bathrooms} onChange={(val) => handleNumberChange('bathrooms', val)}>
              <NumberInputField name="bathrooms" />
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Property Type</FormLabel>
            <Select name="propertyType" value={formData.propertyType} onChange={handleChange}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Status</FormLabel>
            <Select name="status" value={formData.status} onChange={handleChange}>
              <option value="for sale">For Sale</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="under construction">Under Construction</option>
            </Select>
          </FormControl>
        </SimpleGrid>

        <FormControl as="fieldset">
          <FormLabel as="legend">Make this an Auction?</FormLabel>
          <RadioGroup onChange={setIsAuction} value={isAuction}>
            <HStack spacing={6}><Radio value="yes">Yes</Radio><Radio value="no">No</Radio></HStack>
          </RadioGroup>
        </FormControl>

        {isAuction === 'yes' && (
          <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
            <Heading size="sm" mb={4}>Auction Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Starting Price (LKR)</FormLabel>
                <NumberInput min={0} value={auctionData.startingPrice} onChange={(val) => setAuctionData(prev => ({ ...prev, startingPrice: val }))}>
                  <NumberInputField name="startingPrice" />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input name="startTime" type="datetime-local" value={auctionData.startTime} onChange={handleAuctionChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input name="endTime" type="datetime-local" value={auctionData.endTime} onChange={handleAuctionChange} />
              </FormControl>
            </SimpleGrid>
          </Box>
        )}

        <FormControl>
          <FormLabel>Property Images</FormLabel>
          {/* Section to display existing images for editing */}
          {initialData && existingImageUrls.length > 0 && (
            <Box mb={4}>
              <ChakraText fontSize="sm" fontWeight="medium" mb={2}>Current Images (Click to remove)</ChakraText>
              <HStack wrap="wrap" spacing={4}>
                {existingImageUrls.map((url, index) => (
                    <Box key={index} position="relative">
                        <Image src={url} alt={`Existing image ${index + 1}`} boxSize="100px" objectFit="cover" borderRadius="md" />
                        <Button
                            size="xs"
                            colorScheme="red"
                            borderRadius="full"
                            position="absolute"
                            top="-1"
                            right="-1"
                            onClick={() => setExistingImageUrls(prev => prev.filter(imgUrl => imgUrl !== url))}
                        >
                            X
                        </Button>
                    </Box>
                ))}
              </HStack>
            </Box>
          )}

          <Input
            type="file"
            accept=".png,.jpg,.jpeg"
            multiple
            ref={fileInputRef}
            onChange={handleImageFilesChange}
            p={1.5}
            sx={{ '::file-selector-button': { mr: 3 } }}
          />
          <FormHelperText>
            {initialData ? 'Upload NEW images to add to this property.' : 'You can select multiple files.'}
          </FormHelperText>
        </FormControl>

        <Button
          mt={4}
          colorScheme="primary"
          type="submit"
          isLoading={isLoading}
          loadingText={initialData ? "Updating Property..." : "Adding Property..."}
          size="lg"
          w="full"
        >
          {submitButtonText}
        </Button>
      </Stack>
    </Box>
  );
};

export default PropertyForm;