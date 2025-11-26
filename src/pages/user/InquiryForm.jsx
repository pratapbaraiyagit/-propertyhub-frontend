// frontend/src/components/property/InquiryForm.jsx
import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  useColorModeValue,
} from '@chakra-ui/react';
// Assuming useAuth path is correct
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';

const API_ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const InquiryForm = ({ projectId, unitTitle, onFormSubmitSuccess }) => {
  const { isAuthenticated, token } = useAuth ? useAuth() : { isAuthenticated: false, token: null };
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const formBgColor = useColorModeValue('white', 'gray.700');
  const formHelperTextColor = useColorModeValue('gray.600', 'gray.400');

  if (!isAuthenticated) {
    return (
      <Box p={5} borderWidth="1px" rounded="md" textAlign="center" bg={formBgColor}>
        <Text>Please log in to send an inquiry about this property.</Text>
      </Box>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!message.trim()) newErrors.message = 'Your inquiry message cannot be empty.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your inquiry message.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    const inquiryData = {
      projectId,
      message,
    };
    console.log("Inquiry Payload:", inquiryData);
    try {
      // Always send Authorization header explicitly for this request
      const response = await axios.post(
        `${API_ROOT_URL}/api/inquiries`,
        inquiryData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      toast({
        title: 'Inquiry Sent!',
        description: `Your inquiry about "${unitTitle}" has been sent. We'll get back to you soon.`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });

      setMessage('');
      setErrors({});
      // Crucial: Call the success callback to close the modal
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(response.data);
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      // NOTE: The 400 error is likely here. Check error.response?.data?.message
      const errMsg = error.response?.data?.message || error.message || "Could not send your inquiry. Please try again.";
      toast({
        title: 'Submission Failed',
        description: errMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      rounded="lg"
      boxShadow="md"
      bg={formBgColor}
    >
      <Heading as="h3" size="lg" mb={6} textAlign="center">
        Send an Inquiry
      </Heading>
      <Text mb={2} fontSize="md">
        Unit: <Text as="span" fontWeight="semibold">{unitTitle}</Text>
      </Text>
      <Text mb={4} fontSize="sm" color={formHelperTextColor}>
        Have a question about this unit? Send us a message!
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isInvalid={!!errors.message} isRequired>
            <FormLabel htmlFor="inquiryMessage">Your Message</FormLabel>
            <Textarea
              id="inquiryMessage"
              placeholder="Type your question or comment here..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors(prev => ({ ...prev, message: null }));
              }}
              rows={5}
            />
            {errors.message && <FormErrorMessage>{errors.message}</FormErrorMessage>}
          </FormControl>

          <Button
            type="submit"
            colorScheme="secondary" 
            isLoading={isLoading}
            loadingText="Sending..."
            width="full"
            size="lg"
          >
            Send Inquiry
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default InquiryForm;