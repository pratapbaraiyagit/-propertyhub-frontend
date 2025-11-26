import React from 'react';
import { Box, Flex, Heading, Text, Badge, HStack, Icon, useColorModeValue, VStack } from '@chakra-ui/react';
import { FaHome, FaClock, FaCommentDots } from 'react-icons/fa';

const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return { colorScheme: 'yellow', text: 'Pending' };
        case 'confirmed': return { colorScheme: 'green', text: 'Confirmed' };
        case 'declined': case 'rejected': return { colorScheme: 'red', text: 'Declined' };
        case 'completed': return { colorScheme: 'blue', text: 'Completed' };
        case 'cancelled_by_user': return { colorScheme: 'gray', text: 'Cancelled (User)' };
        case 'cancelled_by_admin': return { colorScheme: 'gray', text: 'Cancelled (Admin)' };
        default: return { colorScheme: 'gray', text: status };
    }
};

const VisitRequestCard = ({ visit }) => {
    const cardBg = useColorModeValue('gray.50', 'gray.700');
    const { colorScheme, text } = getStatusBadge(visit.status);

    return (
        <Box
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            bg={cardBg}
            borderLeft="4px solid"
            borderColor={`${colorScheme}.400`}
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
        >
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
                <Box flex="1" mb={{ base: 3, md: 0 }}>
                    <Heading size="sm" mb={2} color="primary.600">{visit.propertyId?.title || 'Property Not Found'}</Heading>
                    <VStack align="start" spacing={1} color="gray.500" fontSize="sm">
                        <HStack>
                            <Icon as={FaHome} w={4} h={4} />
                            <Text noOfLines={1}>{visit.propertyId?.address || 'Address not available'}</Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaClock} w={4} h={4} />
                            <Text>{new Date(visit.preferredDate).toLocaleDateString()} at {visit.preferredTime}</Text>
                        </HStack>
                    </VStack>
                    {visit.message && (
                        <HStack mt={3} color="gray.600" fontSize="xs" fontStyle="italic">
                            <Icon as={FaCommentDots} />
                            <Text>"{visit.message}"</Text>
                        </HStack>
                    )}
                </Box>
                <Badge
                    colorScheme={colorScheme}
                    variant="solid"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                    alignSelf={{ base: 'start', md: 'center' }}
                >
                    {text}
                </Badge>
            </Flex>
        </Box>
    );
};

export default VisitRequestCard;