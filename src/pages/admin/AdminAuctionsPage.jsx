// frontend/src/pages/admin/AdminAuctionsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, Tag, Spinner, Flex, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Text, VStack, HStack, IconButton, Menu, MenuButton, MenuList, MenuItem, Image, Alert
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { format } from 'date-fns'; // For formatting dates
import CreateAuctionForm from '../../components/admin/CreateAuctionForm'; // Import the form
import { formatToLKR } from '../../utils/formatting'; // Import our currency formatter

const AdminAuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Modal controls
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isBiddersOpen, onOpen: onBiddersOpen, onClose: onBiddersClose } = useDisclosure();
  const [selectedAuctionBidders, setSelectedAuctionBidders] = useState([]);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/admin/auctions'); // Use the admin endpoint
      setAuctions(res.data || []);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Could not load auctions.";
      setError(errMsg);
      toast({ title: 'Error loading auctions', description: errMsg, status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleStatusChange = async (propertyId, status) => {
    try {
      await axios.put(`/admin/auctions/${propertyId}`, { status });
      toast({ title: `Auction status updated to ${status}`, status: 'success' });
      fetchAuctions();
    } catch (err) {
      toast({ title: 'Error updating auction status', description: err.response?.data?.message, status: 'error' });
    }
  };

  const handleShowBidders = async (auctionData) => {
    // The bids should already be populated from the initial fetch
    setSelectedAuctionBidders(auctionData.auction.bids || []);
    onBiddersOpen();
  };

 const getStatusColorScheme = (status) => {
    switch (status) {
      case 'Live': return 'green';
      case 'Upcoming': return 'blue';
      case 'Paused': return 'yellow';
      case 'Ended': return 'red';
      default: return 'gray';
    }
};

  if (loading) {
    return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
  }

  if (error) {
    return <Box p={6}><Alert status="error">{error}</Alert></Box>;
  }

  return (
    <Box p={{ base: 2, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Heading size={{ base: 'md', md: 'lg' }}>Manage Auctions</Heading>
        <Button colorScheme="primary" leftIcon={<FaPlus />} onClick={onCreateOpen}>
          Create New Auction
        </Button>
      </Flex>

      <Box overflowX="auto" bg="white" boxShadow="md" borderRadius="md">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th display={{ base: 'none', md: 'table-cell' }}>Image</Th>
              <Th>Property Title</Th>
              <Th>Status</Th>
              <Th display={{ base: 'none', lg: 'table-cell' }}>End Time</Th>
              <Th isNumeric>Current Bid</Th>
              <Th isNumeric display={{ base: 'none', md: 'table-cell' }}>Bids</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {auctions.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" color="gray.500" py={10}>
                  No auction properties found.
                </Td>
              </Tr>
            ) : auctions.map(property => (
              <Tr key={property._id} _hover={{ bg: 'gray.50' }}>
                <Td display={{ base: 'none', md: 'table-cell' }}>
                  <Image src={property.imageUrls?.[0] || 'https://via.placeholder.com/100'} alt={property.title} boxSize="50px" objectFit="cover" borderRadius="md" />
                </Td>
                <Td fontWeight="medium">
                  <VStack align="start" spacing={0}>
                    <Text as={RouterLink} to={`/auctions/${property._id}`} _hover={{ textDecoration: 'underline' }}>
                      {property.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" display={{ base: 'block', lg: 'none' }}>
                      Ends: {property.auction?.endTime ? format(new Date(property.auction.endTime), 'MMM d, h:mm a') : 'N/A'}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Tag size="sm" colorScheme={getStatusColorScheme(property.auction?.status)}>
                    {property.auction?.status || 'N/A'}
                  </Tag>
                </Td>
                <Td display={{ base: 'none', lg: 'table-cell' }}>
                  {property.auction?.endTime ? format(new Date(property.auction.endTime), 'MMM d, yyyy, h:mm a') : 'N/A'}
                </Td>
                <Td isNumeric fontWeight="semibold" color="primary.600">
                  {formatToLKR(property.auction?.currentBid)}
                </Td>
                <Td isNumeric display={{ base: 'none', md: 'table-cell' }}>
                  {property.auction?.bids?.length || 0}
                </Td>
                <Td>
                  <Menu>
                    <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" aria-label="Actions" />
                    <MenuList>
                        <MenuItem onClick={() => handleShowBidders(property)}>View Bidders</MenuItem>
                        <MenuItem as={RouterLink} to={`/admin/auctions/edit/${property._id}`}>Edit Auction</MenuItem>
                        {/* Ensure checks are for the new capitalized statuses */}
                        {property.auction?.status === 'Live' && <MenuItem onClick={() => handleStatusChange(property._id, 'Ended')}>End Auction Now</MenuItem>}
                        {property.auction?.status === 'Upcoming' && <MenuItem onClick={() => handleStatusChange(property._id, 'Live')}>Start Auction Now</MenuItem>}
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Create Auction Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>Create a New Auction</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CreateAuctionForm onSuccess={() => { onCreateClose(); fetchAuctions(); }} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Bidders Modal */}
      <Modal isOpen={isBiddersOpen} onClose={onBiddersClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>Bidder List</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th isNumeric>Amount (LKR)</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedAuctionBidders.length > 0 ? [...selectedAuctionBidders].reverse().map(bid => ( // Newest first
                  <Tr key={bid._id}>
                    <Td>{bid.user?.name} ({bid.user?.email})</Td>
                    <Td isNumeric>{bid.amount.toLocaleString()}</Td>
                    <Td>{format(new Date(bid.createdAt), 'MMM d, h:mm:ss a')}</Td>
                  </Tr>
                )) : (
                  <Tr><Td colSpan={3} textAlign="center">No bids yet.</Td></Tr>
                )}
              </Tbody>
            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminAuctionsPage;