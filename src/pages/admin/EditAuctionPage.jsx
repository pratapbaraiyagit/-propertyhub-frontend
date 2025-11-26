import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, useToast, Button } from '@chakra-ui/react';
import axios from '../../api/axiosInstance';
import CreateAuctionForm from '../../components/admin/CreateAuctionForm';

const EditAuctionPage = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/admin/auctions/${id}`);
        setAuction(res.data);
      } catch (err) {
        toast({ title: 'Error loading auction', description: err.response?.data?.message || err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id, toast]);

  const handleUpdateAuction = async (formData) => {
    try {
      await axios.put(`/admin/auctions/${id}`, formData);
      toast({ title: 'Auction Updated!', status: 'success' });
      navigate('/admin/auctions');
    } catch (error) {
      toast({ title: 'Update Failed', description: error.response?.data?.message, status: 'error' });
    }
  };

  if (loading) return <Spinner size="xl" />;

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <Heading mb={6}>Edit Auction</Heading>
      {auction && (
        <CreateAuctionForm
          initialData={auction}
          onSubmit={handleUpdateAuction}
          isLoading={loading}
          submitButtonText="Update Auction"
        />
      )}
      <Button mt={4} onClick={() => navigate(-1)}>Back</Button>
    </Box>
  );
};

export default EditAuctionPage;
