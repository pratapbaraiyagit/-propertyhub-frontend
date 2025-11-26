// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send the email to the backend endpoint
      const { data } = await axios.post('/auth/forgot-password', { email });

      // Show a success message to the user
      toast({
        title: 'Request Sent',
        description: data.message, // "If an account with that email exists..."
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      // Show an error message if the server fails
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center" bg="gray.50">
      <Box
        p={8}
        maxW="md"
        w="full"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
      >
        <Box textAlign="center" mb={6}>
          <Heading as="h1" size="lg">Forgot Your Password?</Heading>
          <Text mt={2} color="gray.600">
            No problem. Enter your email address below and we'll send you a link to reset it.
          </Text>
        </Box>
        
        <Box as="form" onSubmit={handleSubmit}>
          <FormControl id="email" isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              focusBorderColor="primary.400"
            />
          </FormControl>
          
          <Button
            width="full"
            mt={6}
            type="submit"
            colorScheme="secondary"
            isLoading={loading}
            loadingText="Sending..."
          >
            Send Reset Link
          </Button>

          <Box textAlign="center" mt={4}>
            <ChakraLink as={RouterLink} to="/login" color="primary.500" fontWeight="medium">
              ← Back to Login
            </ChakraLink>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default ForgotPasswordPage;