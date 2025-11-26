import React, { useState, useEffect } from 'react';
import {
  VStack, FormControl, FormLabel, Select, Input, Button, useToast
} from '@chakra-ui/react';
import axios from '../../api/axiosInstance';

const CreateAuctionForm = ({ onSuccess }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Fetch properties that are eligible for auction (e.g., not already in an active auction)
    const fetchEligibleProperties = async () => {
      try {
        const res = await axios.get('/properties', { params: { status: 'for sale' } }); // Or a dedicated endpoint
        setProperties(res.data || []);
      } catch {
        toast({ title: "Failed to load properties", status: 'error' });
      }
    };
    fetchEligibleProperties();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/admin/auctions', {
        propertyId: selectedProperty,
        startTime,
        endTime,
        startingPrice: Number(startingPrice),
        reservePrice: Number(reservePrice),
      });
      toast({ title: 'Auction Created Successfully', status: 'success' });
      onSuccess(); // Close modal and refetch data in parent
    } catch (error) {
      toast({ title: 'Failed to create auction', description: error.response?.data?.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Select Property</FormLabel>
          <Select placeholder="Choose a property" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
            {properties.map(prop => (
              <option key={prop._id} value={prop._id}>{prop.title} ({prop.address})</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)} // Disable previous days
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>End Time</FormLabel>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime ? startTime : new Date().toISOString().slice(0, 16)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Starting Price (LKR)</FormLabel>
          <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Reserve Price (LKR)</FormLabel>
          <Input type="number" value={reservePrice} onChange={(e) => setReservePrice(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="primary" isLoading={isLoading} width="full">
          Create Auction
        </Button>
      </VStack>
    </form>
  );
};

export default CreateAuctionForm;