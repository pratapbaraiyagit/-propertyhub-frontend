// src/components/PreRegistrationForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ScaleFade,
  Flex,
  // New: Import Link from react-router-dom if you have routing
  // import { Link as RouterLink, useNavigate } from 'react-router-dom';
} from '@chakra-ui/react';
// import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Uncomment if using react-router-dom

function PreRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();
  // const navigate = useNavigate(); // Uncomment if using useNavigate

  const successPalette = {
    successText: "green.700",
    successBg: "green.50",
    primary: "primary.600",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Pre-registration submitted:", formData);
      setSubmitted(true);

      toast({
        title: 'Pre-registration Successful!',
        description: 'Thank you for your interest. We will keep you updated!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        name: '',
        email: '',
        contactNo: '',
        message: '',
      });

    } catch (error) {
      toast({
        title: 'Network Error.',
        description: 'Could not connect to the server or submission failed.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle navigation
  const handleGoBack = () => {
    // Option 1: Using history.back() if you just want to go to the previous page
    window.history.back();
    // Option 2: Using react-router-dom's navigate
    // navigate('/projects'); // Replace '/projects' with your desired route
    // Option 3: Hard refresh or redirect (less ideal for SPAs)
    // window.location.href = '/projects';
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      p={{ base: 4, md: 8 }}
    >
      <Box
        p={{ base: 6, md: 8 }}
        maxWidth="600px"
        width="100%"
        margin="auto"
        boxShadow="lg"
        borderRadius="md"
        bg="white"
        textAlign="center"
      >
        <Heading as="h2" size="xl" color={successPalette.primary} textAlign="center" mb={6}>
          Property Hub Pre-Registration
        </Heading>

        <ScaleFade in={submitted} initialScale={0.9}>
          {submitted && (
            <Alert
              status="success"
              variant="left-accent"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px" // Adjust height if needed with the button
              borderRadius="md"
              bg={successPalette.successBg}
              color={successPalette.successText}
              mt={6}
              py={8}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Pre-registration Successful!
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Thank you for your interest. We will keep you updated!
              </AlertDescription>
              {/* New: Back to Project Button */}
              <Button
                mt={6} // Margin top to separate from text
                colorScheme="secondary"
                onClick={handleGoBack} // Use the navigation handler
                // Or if using RouterLink: as={RouterLink} to="/projects"
              >
                Back to Project
              </Button>
            </Alert>
          )}
        </ScaleFade>

        {!submitted && (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl id="name" isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  focusBorderColor={successPalette.primary}
                />
              </FormControl>

              <FormControl id="email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  focusBorderColor={successPalette.primary}
                />
              </FormControl>

              <FormControl id="contactNo">
                <FormLabel>Contact Number (Optional)</FormLabel>
                <Input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  focusBorderColor={successPalette.primary}
                />
              </FormControl>

              <FormControl id="message">
                <FormLabel>Your Message (Optional)</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you!"
                  focusBorderColor={successPalette.primary}
                />
              </FormControl>

              <Button
                mt={4}
                colorScheme="secondary"
                size="lg"
                type="submit"
                isLoading={loading}
                loadingText="Submitting"
                width="full"
                _hover={{ bg: "primary.500" }}
                _active={{ bg: "primary.700" }}
              >
                Pre-Register Now
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Flex>
  );
}

export default PreRegistrationForm;