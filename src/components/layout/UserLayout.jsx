import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is crucial for rendering nested routes
import { Flex, Box } from '@chakra-ui/react';
import UserNavbar from '../UserNavbar'; // Adjust the path if your UserNavbar.jsx is elsewhere
// import Footer from '../Footer'; // Optional: If you have a general site footer

const UserLayout = () => {
  return (
    <Flex direction="column" minH="100vh">
      <UserNavbar /> {/* This layout will always display the UserNavbar */}
      <Box
        as="main"
        maxW={{ base: "none", md: "100vw" }}
        w={{ base: "100%", md: "99vw" }}
        px={0}
        mx={0}
        p={{ base: 2, md: 4 }}
        minH="100vh"
        overflowX="hidden"
        // pt="YOUR_NAVBAR_HEIGHT" // Optional: Add top padding if navbar is fixed/absolute and content might go under it
                                  // If navbar is sticky or part of the flex flow, this might not be needed.
                                  // Or, individual pages can handle their own top padding if necessary.
        // bg="blue.50" // Temporary background to visualize
      >
        <Outlet /> {/* Child routes defined in App.jsx will render here */}
      </Box>
      {/* Optional: Add a shared Footer component here */}
      {/* <Footer /> */}
    </Flex>
  );
};

export default UserLayout;