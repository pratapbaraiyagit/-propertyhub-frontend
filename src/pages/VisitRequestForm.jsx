// frontend/src/components/property/VisitRequestForm.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for react-datepicker
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  useColorModeValue, // Import useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import axios from '../api/axiosInstance';



const VisitRequestForm = ({ propertyId, propertyTitle, onFormSubmitSuccess }) => {
  // Destructure from useAuth, token is not directly used in this component's logic
  const { user, isAuthenticated } = useAuth();

  // State for form fields
  const [selectedDate, setSelectedDate] = useState(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || ''); // Pre-fill if available from user profile
  const [message, setMessage] = useState('');

  // State for validation errors and loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  // --- Call useColorModeValue at the top level ---
  const formBgColor = useColorModeValue('white', 'gray.700');
  const formHelperTextColor = useColorModeValue('gray.600', 'gray.400');
  // Add any other useColorModeValue calls for specific elements if needed here

  // --- Early return for non-authenticated users ---
  // Hooks must be called before any conditional return.
  if (!isAuthenticated || !user) {
    return (
      <Box p={5} borderWidth="1px" rounded="md" textAlign="center" bg={formBgColor}>
        <Text>Please log in to request a property visit.</Text>
        {/* Consider adding: <Button as={RouterLink} to="/login" mt={3}>Login</Button> */}
      </Box>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDate) newErrors.selectedDate = 'Please select a preferred date.';
    if (!preferredTime.trim()) newErrors.preferredTime = 'Please suggest a preferred time.';
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required.';
    } else if (!/^\d{10}$/.test(contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    const visitRequestData = {
      propertyId,
      userId: user.id, // Assuming your user object from AuthContext has an 'id'
      userName: user.name || user.email,
      userEmail: user.email,
      preferredDate: selectedDate.toISOString(),
      preferredTime,
      contactNumber,
      message,
    };

    try {
      // Axios instance should have Authorization header set by AuthContext
   const response = await axios.post(`/visit-requests`, visitRequestData);

      toast({
        title: 'Visit Request Submitted!',
        description: `Your request to visit "${propertyTitle}" has been sent. We'll notify you once it's reviewed.`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });

      setSelectedDate(null);
      setPreferredTime('');
      setMessage('');
      setErrors({});
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(response.data);
      }
    } catch (error) {
      console.error("Error submitting visit request:", error);
      const errMsg = error.response?.data?.message || error.message || "Could not submit your request. Please try again.";
      toast({
        title: 'Submission Failed',
        description: errMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Removed setError(errMsg) as we're relying on toast for general submission errors.
      // If you need a persistent error message in the form, re-add a specific state for it.
    } finally {
      setIsLoading(false);
    }
  };

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      rounded="lg"
      boxShadow="md"
      bg={formBgColor} // Use variable
    >
      <Heading as="h3" size="lg" mb={6} textAlign="center">
        Request a Property Visit
      </Heading>
      <Text mb={2} fontSize="md">
        Property: <Text as="span" fontWeight="semibold">{propertyTitle}</Text>
      </Text>
      <Text mb={4} fontSize="sm" color={formHelperTextColor}> {/* Use variable */}
        Please select your preferred date and time. We will contact you to confirm the appointment.
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isInvalid={!!errors.selectedDate} isRequired>
            <FormLabel htmlFor="preferredDate">Preferred Date</FormLabel>
            <DatePicker
              id="preferredDate"
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                if (errors.selectedDate) setErrors(prev => ({ ...prev, selectedDate: null }));
              }}
              filterDate={isFutureDate}
              minDate={new Date()}
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
              className="chakra-input" // For Chakra-like styling via global styles
              wrapperClassName="date-picker-wrapper" // For full width
              showPopperArrow={false}
              popperPlacement="bottom-start"
            />
            {errors.selectedDate && <FormErrorMessage>{errors.selectedDate}</FormErrorMessage>}
          </FormControl>
          {/* Global styles to make react-datepicker input look like Chakra Input */}
          {/* This needs to be outside the main JSX return if not using a CSS-in-JS lib that supports it directly in JSX scope. */}
          {/* For simplicity here, it's fine, but usually better in a global CSS or styled-component. */}
          <style jsx global>{`
            .date-picker-wrapper, .date-picker-wrapper > div { /* Ensure DatePicker takes full width */
              width: 100%;
            }
            .chakra-input.react-datepicker__input-container input { /* Style the input field */
              width: 100% !important; /* Important may be needed to override DatePicker's inline styles */
              border-color: inherit;
              box-shadow: inherit;
              padding-left: 0.75rem;
              padding-right: 0.75rem;
              height: 2.5rem;      /* Chakra's md input height */
              font-size: 1rem;      /* Chakra's md input font size */
              border-radius: var(--chakra-radii-md); /* Chakra's default border radius */
            }
            .react-datepicker__input-container input:focus {
                 border-color: var(--chakra-colors-blue-500) !important; /* Chakra's focus color */
                 box-shadow: 0 0 0 1px var(--chakra-colors-blue-500) !important;
            }
            /* Optional: Style the calendar popper to match Chakra theme */
            .react-datepicker-popper {
                z-index: 10; /* Ensure it's above other elements */
            }
            .react-datepicker {
                font-family: var(--chakra-fonts-body);
                border: 1px solid var(--chakra-colors-gray-200);
                box-shadow: var(--chakra-shadows-md);
                border-radius: var(--chakra-radii-md);
            }
            .react-datepicker__header {
                background-color: var(--chakra-colors-gray-100);
                border-bottom: 1px solid var(--chakra-colors-gray-200);
            }
            .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
                background-color: var(--chakra-colors-green-500);
            }
            .react-datepicker__day:hover {
                background-color: var(--chakra-colors-gray-200);
            }
          `}</style>

          <FormControl isInvalid={!!errors.preferredTime} isRequired>
            <FormLabel htmlFor="preferredTime">Preferred Time Slot</FormLabel>
            <Input
              id="preferredTime"
              placeholder="e.g., Morning (10 AM - 12 PM), 2:00 PM"
              value={preferredTime}
              onChange={(e) => {
                setPreferredTime(e.target.value);
                if (errors.preferredTime) setErrors(prev => ({ ...prev, preferredTime: null }));
              }}
            />
            {errors.preferredTime && <FormErrorMessage>{errors.preferredTime}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errors.contactNumber} isRequired>
            <FormLabel htmlFor="contactNumber">Your Contact Number</FormLabel>
            <Input
              id="contactNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
                if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: null }));
              }}
            />
            {errors.contactNumber && <FormErrorMessage>{errors.contactNumber}</FormErrorMessage>}
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="message">Additional Questions/Message (Optional)</FormLabel>
            <Textarea
              id="message"
              placeholder="Any specific questions or details about your availability?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isLoading}
            loadingText="Submitting..."
            width="full"
            size="lg"
          >
            Submit Visit Request
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default VisitRequestForm;