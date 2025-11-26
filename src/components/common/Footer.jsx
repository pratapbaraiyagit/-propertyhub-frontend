import { Box, Flex, Text, Stack, Link, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="primary.900"
      color="white"
      py={10}
      px={{ base: 4, md: 8 }}
    
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align="center"
        maxW="6xl"
        mx="auto"
      >
        {/* Logo and company info */}
        <Box mb={{ base: 8, md: 0 }}>
          <Text fontWeight="bold" fontSize="lg" mb={2}>
           Property Hub
          </Text>
          <Text fontSize="sm" color="gray.400">
            Advance Real Estate Platform 
          </Text>
        </Box>

        {/* Footer Links */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 6, md: 12 }}
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Box>
            <Text fontWeight="bold" mb={2}>
              Properties
            </Text>
            <Stack spacing={2}>
              <Link as={RouterLink} to="/features" fontSize="sm" color="gray.400">
                House
              </Link>
              <Link as={RouterLink} to="/pricing" fontSize="sm" color="gray.400">
                Land
              </Link>
              <Link as={RouterLink} to="/docs" fontSize="sm" color="gray.400">
                Annex
              </Link>
            </Stack>
          </Box>

          <Box>
            <Text fontWeight="bold" mb={2}>
              Auction
            </Text>
            <Stack spacing={2}>
              <Link as={RouterLink} to="/about" fontSize="sm" color="gray.400">
                About
              </Link>
              <Link as={RouterLink} to="/blog" fontSize="sm" color="gray.400">
                Blog
              </Link>
              <Link as={RouterLink} to="/careers" fontSize="sm" color="gray.400">
                Bidding
              </Link>
            </Stack>
          </Box>

          <Box>
            <Text fontWeight="bold" mb={2}>
              Legal
            </Text>
            <Stack spacing={2}>
              <Link as={RouterLink} to="/privacy" fontSize="sm" color="gray.400">
                Privacy
              </Link>
              <Link as={RouterLink} to="/terms" fontSize="sm" color="gray.400">
                Terms
              </Link>
              <Link as={RouterLink} to="/cookies" fontSize="sm" color="gray.400">
                Cookie Policy
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Flex>

      {/* Social Links and Copyright */}
      <Flex
        direction={{ base: 'column-reverse', md: 'row' }}
        justify="space-between"
        align="center"
        maxW="6xl"
        mx="auto"
        mt={10}
        pt={6}
        borderTop="1px"
        borderColor="gray.700"
      >
        <Text fontSize="sm" color="gray.400">
          © {new Date().getFullYear()} Property Hub. All rights reserved.
        </Text>

        <Stack direction="row" spacing={6} mb={{ base: 4, md: 0 }}>
          <Link href="https://github.com/" isExternal>
            <Icon as={FaGithub} boxSize={5} color="gray.400" _hover={{ color: 'white' }} />
          </Link>
          <Link href="https://twitter.com/" isExternal>
            <Icon as={FaTwitter} boxSize={5} color="gray.400" _hover={{ color: 'white' }} />
          </Link>
          <Link href="https://linkedin.com/in/" isExternal>
            <Icon as={FaLinkedin} boxSize={5} color="gray.400" _hover={{ color: 'white' }} />
          </Link>
          <Link href="mailto:contact@yourapp.com" isExternal>
            <Icon as={FaEnvelope} boxSize={5} color="gray.400" _hover={{ color: 'white' }} />
          </Link>
        </Stack>
      </Flex>
    </Box>
  );
}