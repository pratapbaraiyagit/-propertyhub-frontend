import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  useColorModeValue,
  useDisclosure,
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  EmailIcon,
  PhoneIcon,
  AddIcon,
} from '@chakra-ui/icons';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Navigation Data ---
const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  {label: 'Quick Compare',href: '/compare',},
  { label: 'Auctions', href: '/auctions' },
  { label: 'Future Apartments', href: '/user/future-projects' },
  { label: 'Contact', href: '/contact' },
];

// --- Main Navbar Component ---
export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      w="full"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="sm"
    >
      <TopBar />
      <MainNav onToggle={onToggle} isOpen={isOpen} />

      <Collapse in={isOpen} animateOpacity>
        <MobileNav onClose={onToggle} />
      </Collapse>
    </Box>
  );
}

// --- Top Utility Bar Component ---
const TopBar = () => {
  return (
    <Box
      bg={useColorModeValue('primary.600', 'primary.800')}
      color={useColorModeValue('white', 'gray.100')}
      display={{ base: 'none', md: 'block' }}
    >
      <Container maxW="container.xl" py={1.5} fontSize="sm">
        <Flex justify="space-between" align="center">
          <HStack spacing={6}>
            <Link href="mailto:propertyhub.sup@gmail.com" display="flex" alignItems="center">
              <Icon as={EmailIcon} mr={2} />
              propertyhub.sup@gmail.com
            </Link>
            <Link href="tel:0553569789" display="flex" alignItems="center">
              <Icon as={PhoneIcon} mr={2} />
              055-356-9789
            </Link>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              as="a"
              href="https://www.facebook.com"
              aria-label="Facebook"
              icon={<FaFacebook />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
            />
            <IconButton
              as="a"
              href="https://www.twitter.com"
              aria-label="Twitter"
              icon={<FaTwitter />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
            />
            <IconButton
              as="a"
              href="https://www.instagram.com"
              aria-label="Instagram"
              icon={<FaInstagram />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

// --- Main Navigation Bar Component ---
const MainNav = ({ onToggle, isOpen }) => {
  return (
    <Container maxW="container.xl">
      <Flex minH={'64px'} align={'center'} justify="space-between">
        <Flex display={{ base: 'flex', md: 'none' }} mr={2}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>

        <Logo />

        <HStack spacing={8} align={'center'} display={{ base: 'none', md: 'flex' }} flex={1} justify="center">
          <DesktopNav />
        </HStack>

        <HStack spacing={3} align={'center'} display={{ base: 'none', md: 'flex' }}>
          <AuthAndActions />
        </HStack>
      </Flex>
    </Container>
  );
};

const Logo = () => (
  <RouterLink to="/">
    <Flex align="center">
      <img src="/property_hub.png" alt="Property Hub Logo" style={{ height: '40px' }} />
      <Text
        fontFamily={'heading'}
        fontWeight="bold"
        fontSize="2xl"
        color={useColorModeValue('primary.600', 'primary.300')}
        ml={2}
      >
        Property Hub
      </Text>
    </Flex>
  </RouterLink>
);

const AuthAndActions = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <Button
        as={RouterLink}
        to="/register"
        variant="solid"
        colorScheme="secondary"
        size="sm"
        leftIcon={<AddIcon />}
      >
       Register
      </Button>
      {!isAuthenticated ? (
        <Button
          as={RouterLink}
          to="/login"
          variant="outline"
          colorScheme="secondary"
          size="sm"
        >
          Login
        </Button>
      ) : (
        <Menu>
          <MenuButton as={Button} rounded={'full'} variant={'link'} cursor={'pointer'} minW={0}>
            <Avatar size={'sm'} name={user?.name || user?.email} />
          </MenuButton>
          <MenuList>
            <MenuItem as={RouterLink} to="/dashboard">Profile</MenuItem>
            <MenuItem color="red.500" onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      )}
    </>
  );
};

// --- ENHANCED DESKTOP NAVIGATION ---
const DesktopNav = () => {
  const location = useLocation();
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('primary.600', 'primary.300');
  // Using a more prominent background color for the active link
  const activeLinkColor = useColorModeValue('primary.700', 'primary.200');
  const activeLinkBg = useColorModeValue('primary.100', 'gray.700'); // Made this more visible

  return (
    <HStack as={'nav'} spacing={6}>
      {NAV_ITEMS.map((navItem) => {
        const isActive = location.pathname === navItem.href;
        return (
          <Link
            as={RouterLink}
            to={navItem.href ?? '#'}
            key={navItem.label}
            px={3} // Added horizontal padding for better spacing
            py={2}
            fontSize={'md'}
            fontWeight={isActive ? 'bold' : 'medium'}
            color={isActive ? activeLinkColor : linkColor}
            bg={isActive ? activeLinkBg : 'transparent'} // This line applies the highlight
            rounded={'md'}
            transition={'all .2s ease'}
            _hover={{
              textDecoration: 'none',
              bg: activeLinkBg,
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </Link>
        );
      })}
    </HStack>
  );
};

const MobileNav = ({ onClose }) => {
  const { isAuthenticated } = useAuth();
  return (
    <Box bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      <VStack as={'nav'} spacing={2} align="stretch">
        {NAV_ITEMS.map((navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} onClose={onClose} />
        ))}
        <Divider my={4} />
        <Button
          as={RouterLink}
          to="/register"
          variant="solid"
          colorScheme="secondary"
          w="full"
          leftIcon={<AddIcon />}
          onClick={onClose}
        >
         Register
        </Button>
        {!isAuthenticated && (
          <Button as={RouterLink} to="/login" variant="outline" colorScheme="secondary" w="full" onClick={onClose}>
            Login 
          </Button>
        )}
      </VStack>
    </Box>
  );
};

// --- ENHANCED MOBILE NAVIGATION ITEM ---
const MobileNavItem = ({ label, href, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  // Define active styles similar to desktop for consistency
  const activeColor = useColorModeValue('primary.700', 'primary.200');
  const activeBg = useColorModeValue('primary.100', 'gray.700');
  const inactiveColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Link
      as={RouterLink}
      to={href ?? '#'}
      onClick={onClose}
      display="block"
      p={3} // Added padding
      rounded="md" // Added border radius
      bg={isActive ? activeBg : 'transparent'} // This line applies the highlight
      _hover={{
        textDecoration: 'none',
        bg: activeBg,
      }}
    >
      <Text
        fontWeight={isActive ? 'bold' : 'medium'}
        color={isActive ? activeColor : inactiveColor}
      >
        {label}
      </Text>
    </Link>
  );
};