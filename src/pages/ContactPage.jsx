// src/components/ContactHelpCenter.jsx
import {
  Container,
  VStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Button,
  Link,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { FiSearch, FiHelpCircle, FiCreditCard, FiMail } from 'react-icons/fi';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Mock data for FAQs
const faqs = [
  {
    question: 'What types of properties can I find on Property Hub?',
    answer: 'You can find residential homes, apartments, commercial spaces, lands, and even upcoming developments with interactive 3D views.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. An email will be sent to you with instructions.',
  },
  {
    question: 'Can I change my subscription plan?',
    answer: 'Yes, you can upgrade or downgrade your subscription plan at any time from your account dashboard under the "Subscription" section.',
  },
  {
    question: 'What is the 3D property view?',
    answer: 'The 3D view allows users to virtually explore properties—including those under construction—before physically visiting, giving you a better sense of space and design.',
  },
];

// Mock data for contact options
const contactOptions = [
  {
    icon: FiHelpCircle,
    title: 'Technical Support',
    description: 'Facing a technical issue? Our experts are here to help.',
    buttonText: 'Email Support',
    href: 'mailto:support@example.com',
  },
  {
    icon: FiCreditCard,
    title: 'Billing & Payments',
    description: 'Questions about your subscription or invoices? Contact our billing team.',
    buttonText: 'Contact Billing',
    href: 'mailto:billing@example.com',
  },
  {
    icon: FiMail,
    title: 'General Inquiry',
    description: 'For all other questions, partnerships, or feedback, get in touch with us.',
    buttonText: 'Send a Message',
    href: 'mailto:hello@example.com',
  },
];

const MotionBox = motion(Box);

export default function ContactHelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFaqs = useMemo(() => 
    faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]
  );

  // Using a dark background that complements the green accent color
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const cardBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'whiteAlpha.300');


  return (
    <Container maxW="container.lg" py={20} bg={bgColor} color={textColor}>
      <VStack spacing={8} textAlign="center">
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading as="h1" size="xl" textAlign="center">How can we help?</Heading>
          <Text fontSize="lg" color={secondaryTextColor} mt={2}>
            Have a question? Find your answer below or get in touch with the right team.
          </Text>
        </MotionBox>

        <InputGroup maxW="xl" size="lg">
          <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.500" />} />
          <Input
            placeholder="Search our knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorderColor}
            _focus={{ borderColor: 'primary.500', boxShadow: `0 0 0 1px var(--chakra-colors-primary-500)` }}
            _placeholder={{ color: 'gray.500' }}
          />
        </InputGroup>
      </VStack>

      <Box my={12}>
        <Accordion allowToggle>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} border="none" mb={4}>
                <h2>
                  <AccordionButton
                    bg={inputBg}
                    borderRadius="lg"
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                    p={6}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} pt={4} px={6} bg={inputBg} borderBottomRadius="lg">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))
          ) : (
            <Text textAlign="center" color={secondaryTextColor} py={10}>
              No results found for "{searchTerm}". Try another search or contact us below.
            </Text>
          )}
        </Accordion>
      </Box>

      <VStack spacing={4} textAlign="center" my={16}>
        <Heading as="h2" size="xl">Still need help?</Heading>
        <Text color={secondaryTextColor}>Choose the right channel to get a fast response.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        {contactOptions.map((option, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              bg={cardBg}
              backdropFilter="blur(10px)"
              h="100%"
              borderRadius="xl"
              p={4}
              textAlign="center"
              border="1px solid"
              borderColor={cardBorderColor}
              _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200'), transform: 'translateY(-5px)' }}
              transition="all 0.3s ease"
            >
              <CardHeader>
                <Flex justify="center">
                  <Icon as={option.icon} boxSize={12} color="primary.500" />
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Heading size="md">{option.title}</Heading>
                  <Text color={secondaryTextColor}>{option.description}</Text>
                  <Button
                    as={Link}
                    href={option.href}
                    isExternal
                    colorScheme="primary"
                  >
                    {option.buttonText}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Container>
  );
}