import React from 'react';
import { NavLink as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Avatar,
  useColorModeValue,
  HStack,
  IconButton,
  useDisclosure,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
} from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navbarBg = useColorModeValue('gray.700', 'gray.800');
  const menuListBg = useColorModeValue('white', 'gray.700');
  const menuItemHoverBg = useColorModeValue('gray.100', 'gray.600');
  const menuItemTextColor = useColorModeValue('gray.800', 'gray.200');
  const activeLinkBg = useColorModeValue('gray.600', 'gray.700');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Manage Properties', to: '/admin/properties' },
    { name: 'Future Apartments', to: '/admin/future-project' },
    { name: 'Auctions', to: '/admin/auctions' },
    { name: 'Manage Users', to: '/admin/users' },
    { name: 'Visit Requests', to: '/admin/visit-requests' },
  ];

  // Profile click handler: always go to admin dashboard
  const handleProfileClick = () => {
    navigate('/admin');
  };

  return (
    <Box
      as="nav"
      bg={navbarBg}
      px={{ base: 4, md: 8 }}
      py={3}
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="1100"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Left Side: Brand Name */}
        <Text
          as={RouterLink}
          to="/admin/dashboard"
          fontSize="xl"
          fontWeight="bold"
          color="white"
          letterSpacing="wide"
          _hover={{
            textDecoration: 'none',
            color: 'gray.200',
            transform: 'scale(1.04)',
            transition: 'all 0.2s',
            cursor: 'pointer',
            boxShadow: 'md',
          }}
        >
          Property Hub - Admin
        </Text>

        {/* Center: Desktop Navigation */}
        <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
          {navLinks.map((link) => (
            <Button
              key={link.name}
              as={RouterLink}
              to={link.to}
              variant="ghost"
              fontWeight="medium"
              color="gray.300"
              _hover={{
                textDecoration: 'none',
                color: 'white',
                bg: activeLinkBg,
              }}
              _activeLink={{
                color: 'white',
                fontWeight: 'bold',
                bg: activeLinkBg,
              }}
            >
              {link.name}
            </Button>
          ))}
        </HStack>

        <Flex alignItems="center">
          {/* Right Side: User Menu */}
          {user && (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                cursor={'pointer'}
                bg={'transparent'}
                _hover={{ bg: activeLinkBg }}
              >
                <HStack>
                  <Avatar size={'sm'} name={user.name || user.email} bg="blue.500" />
                  <Text
                    display={{ base: 'none', md: 'block' }}
                    color="white"
                    fontWeight="medium"
                  >
                    {user.name || 'Admin'}
                  </Text>
                  <ChevronDownIcon color="white" />
                </HStack>
              </MenuButton>
              <MenuList bg={menuListBg}>
                <MenuItem
                  onClick={handleProfileClick}
                  _hover={{ bg: menuItemHoverBg }}
                  color={menuItemTextColor}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {/* Mobile: Hamburger Menu Icon */}
          <IconButton
            size="md"
            icon={<HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={onOpen}
            ml={4}
            variant="ghost"
            color="white"
            _hover={{ bg: activeLinkBg }}
          />
        </Flex>
      </Flex>

      {/* Mobile: Navigation Drawer */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack as="nav" spacing={4} align="stretch">
              {navLinks.map((link) => (
                <Button
                  key={link.name}
                  as={RouterLink}
                  to={link.to}
                  variant="ghost"
                  w="100%"
                  justifyContent="flex-start"
                  onClick={onClose}
                  _activeLink={{
                    color: 'blue.600',
                    bg: 'blue.50',
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default AdminNavbar;