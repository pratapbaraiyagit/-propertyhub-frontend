import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link as ChakraLink,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Input Error',
        description: 'Please enter email and password.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${result.user?.name || result.user?.email}!`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      const userDashboardPath = result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(from === "/login" ? userDashboardPath : from, { replace: true });
    } else {
      toast({
        title: 'Login Failed',
        description: result.message || 'Invalid credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  if (authLoading && !isSubmitting) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Sign in to your account</Heading>
        </Stack>
        <Box
          rounded="lg"
          bg="white"
          boxShadow="lg"
          p={8}
          as="form"
          onSubmit={handleSubmit}
        >
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            {/* --- FORGOT PASSWORD LINK ADDED --- */}
            <Flex justifyContent="flex-end">
              <ChakraLink
                as={RouterLink}
                to="/forgot-password"
                color="primary.500"
                fontSize="sm"
              >
                Forgot Password?
              </ChakraLink>
            </Flex>
            <Stack spacing={6}>
              <Button
                colorScheme="secondary"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Logging in..."
              >
                Sign in
              </Button>
              <Text align="center">
                New user?{" "}
                <ChakraLink as={RouterLink} to="/register" color="primary.500">
                  Register here
                </ChakraLink>
              </Text>
            </Stack>
          </Stack>
        </Box>
        </Stack>
    </Flex>
  );
}

export default LoginPage;