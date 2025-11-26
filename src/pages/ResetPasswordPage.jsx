// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Stack,
} from '@chakra-ui/react';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // These hooks get the :token from the URL and allow for redirection
  const { token } = useParams();
  const navigate = useNavigate();
  
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // First, check if the passwords match
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'The passwords you entered do not match.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      // Send the new password and the token to the backend
      const { data } = await axios.put(`/auth/reset-password/${token}`, { password });
      
      // On success, show a confirmation and redirect to the login page
      toast({
        title: 'Password Reset Successful!',
        description: data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login');

    } catch (error) {
      // If the token is invalid, expired, or something else goes wrong
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.message || 'This reset link may be invalid or has expired.',
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
          <Heading as="h1" size="lg">Set a New Password</Heading>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="password" isRequired>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                focusBorderColor="primary.400"
              />
            </FormControl>
            
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                focusBorderColor="primary.400"
              />
            </FormControl>
            
            <Button
              width="full"
              mt={4}
              type="submit"
              colorScheme="secondary"
              isLoading={loading}
              loadingText="Saving..."
            >
              Set New Password
            </Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default ResetPasswordPage;