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
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box as="header" w="full" boxShadow="sm">
      <Container maxW="container.xl" px={32}>
        <Flex
          bg={useColorModeValue('white', 'primary.800')}
          color={useColorModeValue('primary.600', 'primary.500')}
          minH={'60px'}
          py={{ base: 2 }}
          align={'center'}
          justify="space-between"
         
        >
      
          <Flex align="center">
            <Flex
              flex={{ base: 1, md: 'auto' }}
              ml={{ base: -2 }}
              display={{ base: 'flex', md: 'none' }}
            >
              <IconButton
                onClick={onToggle}
                icon={
                  isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
                }
                variant={'ghost'}
                aria-label={'Toggle Navigation'}
              />
            </Flex>
            
            <RouterLink to="/">
              <Flex align="center">
                <Box boxSize="56px" mr={2}>
                  <img
                    src="/property_hub.png"
                    alt="Property Hub Logo"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>
              
              </Flex>
            </RouterLink>

            <Flex 
              display={{ base: 'none', md: 'flex' }}
              pl={4}
            >
              <DesktopNav />
            </Flex>
          </Flex>

         
          <Stack
            direction={'row'}
            spacing={6}
            align="center"
          >
            <Button
              as={RouterLink}
              to={'/login'}
              fontSize={'sm'}
              fontWeight={500}
              variant={'ghost'}
              colorScheme="primary"
              _hover={{
                bg: 'primary.300',
              }}
            >
              Sign In
            </Button>
            <Button
              as={RouterLink}
              to={'/register'}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'primary.500'}
              _hover={{
                bg: 'primary.600',
              }}
            >
              Sign Up
            </Button>
             <Button
              as={RouterLink}
              to={'/login'}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'red.500'}
              _hover={{
                bg: 'red.600',
              }}
            >
              Logout
            </Button>
          </Stack>
        </Flex>
      </Container>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                to={navItem.href ?? '#'}
                p={2}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.400' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                as={RouterLink}
                key={child.label}
                py={2}
                to={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Properties',
    href: '/Properties',
  },
  {
    label: 'Future Apartments',
   // href: '/user-glb-viewer',
    children: [
      {
        label: 'Aprtments',
        subLabel: 'Browse all our Apartments',
        href: '/user-glb-viewer',
      },
      {
        label: 'Featured',
        subLabel: 'Our best selling items',
        href: '/products/featured',
      },
    ],
  },
  {
    label: 'Auctions',
    href: '/auctions',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];