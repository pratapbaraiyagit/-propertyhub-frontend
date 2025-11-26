// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Heading,
//   Text,
//   VStack,
//   Input,
//   IconButton,
//   Badge,
//   HStack,
//   useColorModeValue,
//   Flex,
//   useToast,
// } from '@chakra-ui/react';
// import { EditIcon, CheckIcon, EmailIcon } from '@chakra-ui/icons';
// import { FaUserCircle } from 'react-icons/fa';

// const ProfileTab = ({ user }) => {
//   const [editName, setEditName] = useState(false);
//   const [name, setName] = useState(user?.name || '');
//   const toast = useToast();

//   // match the same section padding & font sizes you used in UserDashboard
//   //const sectionPadding = { base: 4, md: 6 };
//   const fontSize = { base: 'sm', md: 'md' };
//   //const headingSize = { base: 'md', md: 'lg' };
//   const cardBg = useColorModeValue('white', 'gray.700');

//   useEffect(() => {
//     setName(user?.name || '');
//   }, [user]);

//   const handleSaveName = () => {
//     setEditName(false);
//     toast({
//       title: 'Name updated successfully!',
//       status: 'success',
//       duration: 3000,
//       isClosable: true,
//     });
//   };

//   return (
//     <Box
//   px={{ base: 4, md: 6 }}
//   py={4}
//   maxW="container.md"
//   mx="auto"
//   bg={cardBg}
//   boxShadow="md"
//   borderRadius="lg"
//   w="full"
//   fontSize={{ base: 'md', md: 'lg' }}
// >
//       <HStack mb={5} spacing={3} align="center">
//         <FaUserCircle size={24} color={useColorModeValue('#2D3748', '#EDF2F7')} />
//         <Heading fontSize={{ base: 'lg', md: 'xl' }}>Your Profile</Heading>
//       </HStack>

//       <VStack spacing={5} align="start">
//         <Flex w="full" align="center">
//           <Text fontWeight="bold" minW={{ base: '70px', md: '100px' }}>
//             Name:
//           </Text>

//           {editName ? (
//             <HStack spacing={2}>
//               <Input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 size="sm"
//                 fontSize={fontSize}
//               />
//               <IconButton
//                 icon={<CheckIcon />}
//                 size="sm"
//                 colorScheme="teal"
//                 onClick={handleSaveName}
//                 aria-label="Save Name"
//               />
//             </HStack>
//           ) : (
//             <HStack spacing={2}>
//               <Text>{name}</Text>
//               <IconButton
//                 icon={<EditIcon />}
//                 size="sm"
//                 variant="ghost"
//                 onClick={() => setEditName(true)}
//                 aria-label="Edit Name"
//               />
//             </HStack>
//           )}
//         </Flex>

//         <HStack spacing={2}>
//           <EmailIcon color="gray.500" />
//           <Text fontWeight="bold">Email:</Text>
//           <Text>{user.email}</Text>
//           <Badge colorScheme="primary" variant="subtle">
//             Verified
//           </Badge>
//         </HStack>
//       </VStack>
//     </Box>
//   );
// };

// export default ProfileTab;

// frontend/src/components/user/ProfileTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Heading,
  Text,
  useColorModeValue,
  Flex
} from '@chakra-ui/react';
import axios from '../../api/axiosInstance';

const ProfileTab = () => {
  const { user, login } = useAuth(); // login is used to update the user in context
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');

  // We need to use user from context as the initial state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const updatedData = { name, phone };

    try {
      const response = await axios.put('/auth/me', updatedData);

      // To update the user globally in the app, we can re-leverage the login function
      // It expects token and user. We pass the existing token and the new user data.
      const currentToken = localStorage.getItem('token');
      login({ token: currentToken, user: response.data.user, fromUpdate: true }); // Pass a flag to avoid "Login Successful" message

      toast({
        title: 'Profile Updated',
        description: 'Your details have been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Could not update your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg={cardBg} boxShadow="md" borderRadius="lg">
      <Heading as="h2" size="md" mb={6}>Your Profile</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl id="email" isReadOnly>
            <FormLabel>Email Address</FormLabel>
            <Input type="email" value={user?.email || ''} bg={useColorModeValue('gray.100', 'gray.800')} />
            <Text fontSize="xs" color="gray.500" mt={1}>Email address cannot be changed.</Text>
          </FormControl>
          <FormControl id="name" isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl id="phone">
            <FormLabel>Phone Number</FormLabel>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +94771234567" />
          </FormControl>
          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isUpdating}
            loadingText="Saving..."
            alignSelf="flex-start"
          >
            Save Changes
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ProfileTab;