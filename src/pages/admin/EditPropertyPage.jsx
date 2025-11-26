// src/pages/admin/EditPropertyPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Spinner,
  useToast,
  Flex,
  IconButton,
  Icon,
  Box,
  Text // Import Box for better spacing control if needed
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import axios from '../../api/axiosInstance';
import PropertyForm from '../../components/PropertyForm';



const EditPropertyPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
 // const [isSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // const res = await axios.get(`${API_ROOT_URL}/api/properties/${id}`);
  //const res = await axios.get(`/api/admin/properties/${id}`);
   const res = await axios.get(`/admin/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        toast({ title: 'Error loading property', description: err.response?.data?.message || err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, toast]);

  const handleUpdateProperty = async (formDataObject) => {
        setIsLoading(true);
        
        // 1. Create a FormData object to handle file uploads
        const formData = new FormData();

        // 2. Append all the different parts of your data
        //    Property and Auction data must be "stringified" to be sent with files
        formData.append('propertyData', JSON.stringify(formDataObject.propertyData));
        formData.append('auctionData', JSON.stringify(formDataObject.auctionData));
        formData.append('isAuction', formDataObject.isAuction);
        
        // Append the list of old images you want to keep
        formData.append('existingImageUrls', JSON.stringify(formDataObject.existingImageUrls));

        // Append each new image file
        formDataObject.imageFiles.forEach(file => {
             formData.append('imageFiles', file); // 'images' must match your multer field name
        });

        try {
            // 3. Send the FormData object to the correct admin endpoint
            await axios.put(`/admin/properties/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });

            toast({ title: 'Property Updated!', status: 'success' });
            navigate('/admin/properties'); // Go back to the list
        } catch (error) {
            toast({ title: 'Update Failed', description: error.response?.data?.message, status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

  if (loading) return <Flex justify="center" align="center" minH="60vh"><Spinner size="xl" /></Flex>;

  return (
    <Container maxW="container.lg" py={{ base: 6, md: 8 }} p={{ base: 4, md: 8 }}> {/* Responsive padding */}
      <Flex mb={6} align="center">
        <IconButton
          icon={<Icon as={FaArrowLeft} />}
          aria-label="Back to Admin Properties"
          onClick={() => navigate(-1)}
          variant="ghost"
          mr={4}
        />
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>Edit Property</Heading> {/* Responsive heading size */}
      </Flex>
      {property && ( // Render PropertyForm only if property data is available
        // <PropertyForm initialData={property} onSubmit={handleUpdateProperty} isLoading={isSaving} submitButtonText="Update Property" />
        <PropertyForm 
                initialData={property} 
                onSubmit={handleUpdateProperty} 
                isLoading={isLoading}
                submitButtonText="Update Property"
            />
      )}
    </Container>
  );
};

export default EditPropertyPage;