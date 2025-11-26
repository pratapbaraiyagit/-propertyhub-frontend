import React, { useEffect, useState } from 'react';
import { Box, Heading, List, ListItem, Text, Badge, Spinner, Alert, AlertIcon, Flex } from '@chakra-ui/react';
import axios from 'axios';

const statusColor = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
};

const RequestedVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/visit-requests/my')
      .then(res => {
        setVisits(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load visit requests');
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>Requested Visits</Heading>
      {visits.length === 0 ? (
        <Text>No visit requests found.</Text>
      ) : (
        <List spacing={3}>
          {visits.map(v => (
            <ListItem key={v._id} borderWidth="1px" borderRadius="md" p={3} boxShadow="sm">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{v.property?.title || 'Property'}</Text>
                  <Text fontSize="sm">Date: {new Date(v.preferredDate).toLocaleDateString()} | Time: {v.preferredTime}</Text>
                  <Text fontSize="sm">Contact: {v.contactNumber}</Text>
                  {v.message && <Text fontSize="sm">Message: {v.message}</Text>}
                </Box>
                <Badge colorScheme={statusColor[v.status]} fontSize="1em" px={3} py={1} borderRadius="md" textTransform="capitalize">{v.status}</Badge>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RequestedVisits;
