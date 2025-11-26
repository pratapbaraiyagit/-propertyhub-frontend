// frontend/src/pages/HomePage.jsx

import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Container,
  Icon,
  Stack,
  Avatar,
  Link,
  useToast,
  VStack,
  HStack,
  IconButton,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useRef, useEffect } from 'react';
import {
  FaHome,
  FaGavel,
  FaBuilding,
  FaBalanceScale,
  FaCalendarCheck,
  FaComments,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaSearch,
  FaKey,
  FaFileSignature,
  FaQuoteLeft,
  FaTimes,
} from 'react-icons/fa';

const MotionBox = motion(Box);

const features = [
  { title: 'Browse Properties', text: 'Find your perfect property from a wide range of verified listings.', icon: FaHome, link: '/properties' },
  { title: 'Live Auctions', text: 'Bid on properties securely and get the best deals in real-time.', icon: FaGavel, link: '/auctions' },
  { title: 'Future Apartments', text: 'Explore upcoming apartment projects and reserve your spot early.', icon: FaBuilding, link: '/user/future-projects' },
  { title: 'Compare Properties', text: 'Compare properties side-by-side to make confident decisions.', icon: FaBalanceScale, link: '/compare' },
  { title: 'Schedule Visits', text: 'Book personalized tours for properties you like effortlessly.', icon: FaCalendarCheck, link: '/visit-requests' },
];

const howItWorksSteps = [
  { icon: FaSearch, title: 'Find Your Property', description: 'Use our advanced filters to find the property that matches your criteria.' },
  { icon: FaKey, title: 'Visit & Inspect', description: 'Schedule a visit with our agents to see your chosen properties in person.' },
  { icon: FaFileSignature, title: 'Secure Your Home', description: 'Place your bid or make an offer. We handle the paperwork securely.' },
];

const testimonials = [
  { name: 'Nimasha D.', role: 'Property Buyer', feedback: 'Property Hub helped me find my dream apartment effortlessly. The platform is intuitive and trustworthy.', avatar: '/avatar1.jpg' },
  { name: 'Tharindu P.', role: 'Investor', feedback: 'The live auction feature is amazing. I secured a property below market value in minutes.', avatar: '/avatar2.jpg' },
  { name: 'Ishara S.', role: 'Seller', feedback: 'Listing and managing property was smooth, and the support team was responsive throughout.', avatar: '/avatar3.jpg' },
];

// --- AI Chatbot Component ---

function AIChatbot({ isOpen, onClose }) {
  const [messages, setMessages] = React.useState([
    { from: 'bot', text: 'Hi! 👋 How can I help you with Property Hub today?' }
  ]);
  const [input, setInput] = React.useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Simulate AI response (replace with real API integration)
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: "I'm an AI assistant. I'll connect you to the right resources or answer your questions about properties, auctions, or visits!" }
      ]);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      bottom="100px"
      right="32px"
      w={{ base: '90vw', sm: '350px' }}
      h="450px"
      bg="white"
      borderRadius="xl"
      boxShadow="2xl"
      zIndex={9999}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Flex bg="primary.600" color="white" align="center" px={4} py={3} justify="space-between">
        <Heading size="sm">Property Hub AI Chat</Heading>
        <IconButton
          icon={<FaTimes />}
          aria-label="Close chat"
          size="sm"
          colorScheme="whiteAlpha"
          onClick={onClose}
        />
      </Flex>
      <Box flex="1" px={4} py={2} overflowY="auto" bg="gray.50">
        {messages.map((msg, idx) => (
          <Box key={idx} mb={2} textAlign={msg.from === 'user' ? 'right' : 'left'}>
            <Box
              display="inline-block"
              bg={msg.from === 'user' ? 'primary.100' : 'gray.200'}
              color="gray.800"
              px={3}
              py={2}
              borderRadius="lg"
              fontSize="sm"
              maxW="80%"
            >
              {msg.text}
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>
      <Box px={4} py={3} bg="gray.100">
        <Flex as="form" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            bg="white"
            mr={2}
          />
          <IconButton
            icon={<ArrowForwardIcon />}
            colorScheme="primary"
            type="submit"
            aria-label="Send"
          />
        </Flex>
      </Box>
    </Box>
  );
}

// Helper component for footer section headers
const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'bold'} fontSize={'lg'} mb={2} color="white">
      {children}
    </Text>
  );
};
function HomePage() {
  const toast = useToast();
  const [email, setEmail] = React.useState('');
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: "Subscribed!",
      description: "You have been subscribed to our newsletter.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setEmail('');
  };

  // Scroll to top and navigate to /properties
  const handleExploreProperties = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate('/properties');
  };

  // Predefined public questions and answers for the chatbot
  const publicQA = [
    {
      question: "Property Hub",
      answer: "Property Hub is a platform for buying, selling, and discovering properties, including live auctions and future projects."
    },
    {
      question: "How do I participate in an auction?",
      answer: "To join an auction, register an account, browse available auctions, and place your bids securely online."
    },
    {
      question: "Can I schedule a property visit?",
      answer: "Yes! You can schedule visits for listed properties directly from the property details page."
    },
    {
      question: "Is free to use?",
      answer: "Browsing and searching properties is free. Some premium features may require registration."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team via the contact form or chat, available on every page."
    }
  ];

  // --- Modified AI Chatbot Component ---
  function AIChatbot({ isOpen, onClose }) {
    const [messages, setMessages] = React.useState([
      { from: 'bot', text: 'Hi! 👋 How can I help you with Property Hub today?' },
     // { from: 'bot', text: 'Here are some common questions you can ask:' },
      //...publicQA.map(qa => ({ from: 'bot', text: `• ${qa.question}` }))
    ]);
    const [input, setInput] = React.useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, isOpen]);

    // Check for public question match
    const handleSend = async () => {
      if (!input.trim()) return;
      setMessages(prev => [...prev, { from: 'user', text: input }]);
      setInput('');
      setTimeout(() => {
        const match = publicQA.find(qa =>
          qa.question.toLowerCase() === input.trim().toLowerCase()
        );
        if (match) {
          setMessages(prev => [
            ...prev,
            { from: 'bot', text: match.answer }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { from: 'bot', text: "I'm an AI assistant. I'll connect you to the right resources or answer your questions about properties, auctions, or visits!" }
          ]);
        }
      }, 1200);
    };

    if (!isOpen) return null;

    return (
      <Box
        position="fixed"
        bottom="100px"
        right="32px"
        w={{ base: '90vw', sm: '350px' }}
        h="450px"
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        zIndex={9999}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Flex bg="primary.600" color="white" align="center" px={4} py={3} justify="space-between">
          <Heading size="sm">Property Hub AI Chat</Heading>
          <IconButton
            icon={<FaTimes />}
            aria-label="Close chat"
            size="sm"
            colorScheme="whiteAlpha"
            onClick={onClose}
          />
        </Flex>
        <Box flex="1" px={4} py={2} overflowY="auto" bg="gray.50">
          {messages.map((msg, idx) => (
            <Box key={idx} mb={2} textAlign={msg.from === 'user' ? 'right' : 'left'}>
              <Box
                display="inline-block"
                bg={msg.from === 'user' ? 'primary.100' : 'gray.200'}
                color="gray.800"
                px={3}
                py={2}
                borderRadius="lg"
                fontSize="sm"
                maxW="80%"
              >
                {msg.text}
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>
        <Box px={4} py={3} bg="gray.100">
          <Flex as="form" onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              bg="white"
              mr={2}
            />
            <IconButton
              icon={<ArrowForwardIcon />}
              colorScheme="primary"
              type="submit"
              aria-label="Send"
            />
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="gray.50">
      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        h={{ base: '70vh', md: '90vh' }}
        bgImage="url('/bg.jpg')" 
        bgPosition="center"
      >
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(to-t, blackAlpha.800, blackAlpha.400)"
          align="center"
          justify="center"
          color="white"
          textAlign="center"
          p={6}
        >
          <VStack spacing={6}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Heading as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="bold">
                Find Your Next Home, Seamlessly
              </Heading>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <Text fontSize={{ base: 'lg', md: '2xl' }} maxW="xl">
                The most trusted platform for buying, selling, and discovering properties.
              </Text>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <Button
                as={RouterLink}
                to="/properties"
                colorScheme="primary"
                size="lg"
                px={10}
                py={7}
                borderRadius="full"
                fontWeight="bold"
                rightIcon={<ArrowForwardIcon />}
                _hover={{ transform: 'scale(1.05)', boxShadow: 'lg',color: 'white' }}
              >
                Explore Properties
              </Button>
            </MotionBox>
          </VStack>
        </Flex>
      </Box>

      {/* Features Section */}
      <Container as="section" maxW="container.xl" py={{ base: 16, md: 24 }}>
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading as="h2" size="xl" fontWeight="bold" color="gray.800">
            Why Choose Property Hub?
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            We offer a complete suite of tools to make your real estate journey as smooth as possible.
          </Text>
        </VStack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {features.slice(0, 3).map((feature, idx) => ( 
            <MotionBox
              key={feature.title}
              p={8}
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor="gray.300"
              whileHover={{ y: -5, boxShadow: 'xl' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Flex align="center" justify="center" bg="primary.100" borderRadius="full" w={16} h={16} mb={5}>
                <Icon as={feature.icon} w={8} h={8} color="primary.500" />
              </Flex>
              <Heading size="md" mb={3} color="gray.800">{feature.title}</Heading>
              <Text color="gray.600" mb={5}>{feature.text}</Text>
              <Link as={RouterLink} to={feature.link} color="primary.500" fontWeight="bold">
                Learn More <Icon as={ArrowForwardIcon} />
              </Link>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
      
      {/* How It Works Section */}
      <Box as="section" bg="gray.200" py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl" fontWeight="bold" color="gray.800">
              Get Started in 3 Simple Steps
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Our process is designed for your convenience and peace of mind.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 10, md: 8 }}>
            {howItWorksSteps.map((step, idx) => (
              <VStack key={step.title} spacing={4} textAlign="center">
                 <Flex align="center" justify="center" bg="gray.100" borderRadius="full" w={20} h={20} border="2px" borderColor="primary.200">
                    <Icon as={step.icon} w={10} h={10} color="primary.500" />
                 </Flex>
                 <Heading size="md" color="gray.800">{step.title}</Heading>
                 <Text color="gray.600">{step.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box as="section" bg="gray.50" py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl" fontWeight="bold" color="gray.800">
              Loved by Our Users
            </Heading>
          </VStack>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {testimonials.map((t, idx) => (
              <MotionBox
                key={t.name}
                bg="white"
                borderRadius="xl"
                p={8}
                boxShadow="md"
                border="1px"
                borderColor="gray.200"
                whileHover={{ y: -5, boxShadow: 'xl' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                position="relative"
              >
                <Icon as={FaQuoteLeft} w={10} h={10} color="primary.100" position="absolute" top={4} left={4} zIndex={0} />
                <VStack spacing={4} zIndex={1} position="relative">
                  <Avatar src={t.avatar} name={t.name} size="lg" mb={2} />
                  <Text fontSize="lg" color="gray.600" fontStyle="italic">"{t.feedback}"</Text>
                  <Box textAlign="center">
                    <Text fontWeight="bold" fontSize="md" color="gray.800">{t.name}</Text>
                    <Text fontSize="sm" color="gray.500">{t.role}</Text>
                  </Box>
                </VStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box as="section" bg="primary.700" color="white">
        <Container maxW="container.lg" py={{ base: 16, md: 20 }} textAlign="center">
          <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
            Ready to Find Your Dream Home?
          </Heading>
          <Text fontSize="lg" maxW="xl" mx="auto" mb={8}>
            Let's get started. Create an account to save properties, schedule visits, and receive personalized alerts.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
            <Button
              colorScheme="primary"
              color="white"
              size="lg"
              px={8}
              borderRadius="full"
              onClick={handleExploreProperties}
            >
              Explore Properties
            </Button>
            <Button as={RouterLink} to="/register" variant="outline" colorScheme="whiteAlpha" size="lg" px={8} borderRadius="full">
              Become a Buyer
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
    <Box bg="gray.900" color="gray.400">
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <Heading fontSize="md" color="white" mb={2}>Property Hub</Heading>
            <Text fontSize="sm">© {new Date().getFullYear()} Property Hub. All rights reserved.</Text>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'bold'} color="white">Quick Links</Text>
            <Link as={RouterLink} to="/">Home</Link>
            <Link as={RouterLink} to="/properties">Properties</Link>
            <Link as={RouterLink} to="/auctions">Auctions</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'bold'} color="white">Legal</Text>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'bold'} color="white">Follow Us</Text>
            <HStack spacing={4}>
              <Link href={'#'} isExternal><Icon as={FaFacebook} w={5} h={5} /></Link>
              <Link href={'#'} isExternal><Icon as={FaInstagram} w={5} h={5} /></Link>
              <Link href={'#'} isExternal><Icon as={FaLinkedin} w={5} h={5} /></Link>
              <Link href={'#'} isExternal><Icon as={FaTwitter} w={5} h={5} /></Link>
            </HStack>
          </Stack>
        </SimpleGrid>
      </Container>
        {/* Floating Chat Button */}
          <Button
            position="fixed"
            bottom="24px"
            right="24px"
            colorScheme="primary"
            borderRadius="full"
            boxShadow="xl"
            w="60px"
            h="60px"
            aria-label="Chat with us"
            onClick={() => setIsChatOpen(true)}
            _hover={{ transform: 'scale(1.1)' }}
          >
            <Icon as={FaComments} w={6} h={6} />
          </Button>
          <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </Box>
      </Box>
    );
  }


export default HomePage;