// src/pages/admin/AddPropertyPage.jsx
import React, { useState } from 'react';
import { Box, Heading, Container, useToast, IconButton, Flex, Icon } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import PropertyForm from '../../components/PropertyForm'; // Adjust path
//import { useAuth } from '../../context/AuthContext'; // To get the token for API calls
import axios from '../../api/axiosInstance';
import { FaArrowLeft } from 'react-icons/fa';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'; // Or use axios default

const AddPropertyPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  //const { token } = useAuth(); // Get token for authenticated requests

// const handleAddProperty = async (formDataFromComponent) => {
//   setIsLoading(true);

//   // Destructure the data coming from PropertyForm.jsx
//   const { propertyData, auctionData, isAuction, imageFiles } = formDataFromComponent;

//   // 1. Create a FormData object to handle file uploads
//   const submissionData = new FormData();

//   // 2. Combine address fields into a single 'address' string
//   const fullAddress = [
//     propertyData.addressLine1,
//     propertyData.addressLine2,
//     propertyData.addressLine3,
//   ].filter(Boolean).join(', '); // filter(Boolean) removes empty/null lines

//   // 3. Append all the simple key-value pairs from the property data
//   for (const key in propertyData) {
//     // Skip the individual address lines as we have the combined one
//     if (!key.startsWith('addressLine')) {
//       submissionData.append(key, propertyData[key]);
//     }
//   }
//   submissionData.append('address', fullAddress); // Add the combined address

//   // 4. Handle auction data if it's an auction
//   if (isAuction === 'yes') {
//     submissionData.append('auction[startTime]', auctionData.startTime);
//     submissionData.append('auction[endTime]', auctionData.endTime);
//     submissionData.append('auction[startingPrice]', auctionData.startingPrice);
//   }

//   // 5. Append the image files
//   if (imageFiles && imageFiles.length > 0) {
//     imageFiles.forEach(file => {
//       submissionData.append('imageFiles', file); // 'images' should match your multer field name
//     });
//   }

//   try {
//     // 6. Send the FormData object. Axios will set the correct 'multipart/form-data' header.
//     const response = await axios.post(`/admin/properties`, submissionData);

//     toast({
//       title: 'Property Added',
//       description: `"${response.data.property.title}" has been successfully added.`,
//       status: 'success',
//       duration: 5000,
//       isClosable: true,
//     });
//     navigate('/admin/properties');
//   } catch (error) {
//     console.error("Failed to add property:", error);
//     toast({
//       title: 'Error Adding Property',
//       description: error.response?.data?.message || 'Could not add property.',
//       status: 'error',
//       duration: 7000,
//       isClosable: true,
//     });
//   } finally {
//     setIsLoading(false);
//   }
// };

const handleAddProperty = async (formDataFromComponent) => {
  setIsLoading(true);
  const { propertyData, auctionData, isAuction, imageFiles } = formDataFromComponent;
  const submissionData = new FormData();

  const fullAddress = [propertyData.addressLine1, propertyData.addressLine2, propertyData.addressLine3].filter(Boolean).join(', ');

  for (const key in propertyData) {
    if (!key.startsWith('addressLine')) submissionData.append(key, propertyData[key]);
  }
  submissionData.append('address', fullAddress);

  // Auction fields
  if (isAuction === 'yes') {
    for (const key in auctionData) {
      submissionData.append(`auction[${key}]`, auctionData[key]);
    }
  }

  // Images
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => submissionData.append('imageFiles', file));
  }

  try {
    const response = await axios.post('/admin/properties', submissionData, {
      headers: { 'Content-Type': 'multipart/form-data' } // include Authorization if needed
    });

    toast({ title: 'Property Added', description: `"${response.data.property.title}" added.`, status: 'success' });
    navigate('/admin/properties');
  } catch (error) {
    console.error('Add Property Error:', error.response?.data || error);
    toast({ title: 'Add Failed', description: error.response?.data?.message || 'Check console', status: 'error' });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Container maxW="container.lg" py={8}>
       <Flex mb={6} align="center">
        <IconButton
          icon={<Icon as={FaArrowLeft} />}
          aria-label="Back to Admin Properties"
          onClick={() => navigate(-1)} // Or navigate('/admin/properties-list')
          variant="ghost"
          mr={4}
        />
        <Heading as="h1" size="xl">Add New Property</Heading>
      </Flex>
      <PropertyForm onSubmit={handleAddProperty} isLoading={isLoading} submitButtonText="Add Property" />
    </Container>
  );
};

export default AddPropertyPage;