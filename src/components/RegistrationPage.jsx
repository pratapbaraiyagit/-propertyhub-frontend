import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/register', form);
      login(data);
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Registration failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

return (
    <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-r, primary.50, secondary.50)"
        px={4}
    >
        <Box
            w="full"
            maxW="md"
            bg={useColorModeValue('white', 'gray.800')}
            p={10}
            borderRadius="2xl"
            boxShadow="2xl"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
            <VStack spacing={4} mb={4}>
                <img
                    src="/property_hub.png"
                    alt="Property Hub Logo"
                    style={{ width: 64, height: 64 }}
                />
              
            </VStack>
        
            <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                    <FormControl id="name" isRequired>
                        <FormLabel fontWeight="semibold">Full Name</FormLabel>
                        <Input
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            size="lg"
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            border="none"
                            _focus={{ bg: useColorModeValue('white', 'gray.600'), borderColor: 'primary.400' }}
                        />
                    </FormControl>

                    <FormControl id="email" isRequired>
                        <FormLabel fontWeight="semibold">Email Address</FormLabel>
                        <Input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={form.email}
                            onChange={handleChange}
                            size="lg"
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            border="none"
                            _focus={{ bg: useColorModeValue('white', 'gray.600'), borderColor: 'primary.400' }}
                        />
                    </FormControl>

                    <FormControl id="password" isRequired>
                        <FormLabel fontWeight="semibold">Password</FormLabel>
                        <Input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            size="lg"
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            border="none"
                            _focus={{ bg: useColorModeValue('white', 'gray.600'), borderColor: 'primary.400' }}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="primary"
                        width="full"
                        size="lg"
                        isLoading={loading}
                        borderRadius="full"
                        boxShadow="md"
                        fontWeight="bold"
                        letterSpacing="wide"
                    >
                        Register
                    </Button>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        Already have an account?{' '}
                        <a href="/login" style={{ color: '#38A169', fontWeight: 600 }}>
                            Login
                        </a>
                    </Text>
                </VStack>
            </form>
        </Box>
    </Box>
);
};

export default RegisterPage;
