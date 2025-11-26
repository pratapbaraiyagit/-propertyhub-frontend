// frontend/src/pages/RegisterPage.jsx
import React, { useState , useEffect} from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link as ChakraLink,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  useColorModeValue,
  Alert,      
  AlertIcon,  
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // Optional
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // For displaying errors from AuthContext or local validation
  const [pageError, setPageError] = useState('');

  const { register, loading, isAuthenticated, initialLoading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const formBgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    // If there's an error from AuthContext, display it on the page
    if (authError) {
      setPageError(authError);
    }
  }, [authError]);


  if (initialLoading) {
    return <Flex justify="center" align="center" minH="100vh"><div>Loading session...</div></Flex>;
  }

  if (isAuthenticated) {
    // If user is already logged in, redirect them from the register page
    return <Navigate to="/dashboard" replace />; // Or to '/' or '/admin/dashboard' based on role
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError(''); // Clear previous page errors
    clearError(); // Clear errors from AuthContext

    if (password !== confirmPassword) {
      setPageError('Passwords do not match.');
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (password.length < 6) { // Basic password length validation
        setPageError('Password must be at least 6 characters long.');
        toast({ title: 'Validation Error', description: 'Password must be at least 6 characters.', status: 'error', duration: 3000, isClosable: true });
        return;
    }

    const result = await register({ name, email, password, phone });

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: result.message || "You've been successfully registered and logged in!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Navigate to dashboard or a welcome page after successful registration and login
      // The AuthContext already sets the user and token, so they are effectively logged in
      navigate(result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'); // Or just '/dashboard'
    } else {
      // Error is already set in AuthContext, and we copied it to pageError
      // The toast for failure is also handled by AuthContext's error state or directly here
      setPageError(result.message || 'Registration failed. Please try again.');
      // No need for another toast here if pageError is displayed and AuthContext might show one
    }
  };

  return (
    <Flex w="99vw" maxW="100vw" px={0} mx={0} p={{ base: 2, md: 4 }} overflowX="hidden" align="center" justify="center" bg={bgColor}>
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6" textAlign="center">
            {/* <Image src="/property_hub.png" alt="Property Hub Logo" mx="auto" boxSize="100px" /> */}
            <Heading size={{ base: 'md', md: 'lg' }}>Create an Account</Heading>
            <Text color="muted">Join Property Hub to find your dream property.</Text>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={formBgColor}
            boxShadow={{ base: 'none', sm: 'xl' }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <FormControl id="name" isRequired isInvalid={!!pageError && pageError.toLowerCase().includes('name')}>
                  <FormLabel>Full Name</FormLabel>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>

                <FormControl id="email" isRequired isInvalid={!!pageError && (pageError.toLowerCase().includes('email') || pageError.toLowerCase().includes('user already exists'))}>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormControl>

                <FormControl id="password" isRequired isInvalid={!!pageError && pageError.toLowerCase().includes('password')}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                   {password && password.length < 6 && <FormErrorMessage>Password must be at least 6 characters.</FormErrorMessage>}
                </FormControl>

                <FormControl id="confirmPassword" isRequired isInvalid={password !== confirmPassword && confirmPassword !== ''}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <InputRightElement>
                      <IconButton
                        variant="ghost"
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {password !== confirmPassword && confirmPassword !== '' && (
                    <FormErrorMessage>Passwords do not match.</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl id="phone">
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FormControl>

                {pageError && (
                  <Alert status="error" variant="subtle" mt={2}>
                    <AlertIcon />
                    {pageError}
                  </Alert>
                )}

                <Button type="submit" colorScheme="primary" size="lg" fontSize="md" isLoading={loading}>
                  Create Account
                </Button>
              </Stack>
            </form>
            <Stack spacing="6" mt="8" textAlign="center">
              <Text fontSize="sm">
                Already have an account?{' '}
                <ChakraLink as={RouterLink} to="/login" color="primary.500" fontWeight="semibold">
                  Log in
                </ChakraLink>
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
}

export default RegisterPage;