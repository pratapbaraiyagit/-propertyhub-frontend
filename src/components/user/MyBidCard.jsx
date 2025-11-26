// frontend/src/components/user/MyBidCard.jsx
import React from 'react';
import { Box, Flex, Heading, Text, Image, Button, Tag, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { formatToLKR } from '../../utils/formatting';

const MyBidCard = ({ auction }) => {
  const isAuctionLive = auction.auctionStatus === 'Live';

  // Safely convert bid values to numbers, defaulting to 0 if they are invalid
  const myHighestBid = Number(auction.myHighestBid) || 0;
  const currentBid = Number(auction.currentBid) || 0;

  const isWinning = myHighestBid >= currentBid;
  const statusColorScheme = isAuctionLive ? (isWinning ? 'green' : 'orange') : 'gray';
  const statusText = isAuctionLive ? (isWinning ? 'Winning' : 'Outbid') : 'Ended';
  const borderColor = useColorModeValue(`${statusColorScheme}.200`, `${statusColorScheme}.500`);

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      align={{ base: 'stretch', sm: 'center' }}
      boxShadow="sm"
      borderLeft="4px"
      borderColor={borderColor}
    >
      <Image
        src={auction.propertyImage}
        w={{ base: 'full', sm: '120px' }}
        h={{ base: '120px', sm: '100px' }}
        objectFit="cover"
        borderRadius="md"
        mr={{ base: 0, sm: 4 }}
        mb={{ base: 3, sm: 0 }}
        fallbackSrc="https://via.placeholder.com/150"
      />
      <Box flex="1">
        <Heading size="sm" noOfLines={2} mb={2}>{auction.propertyTitle}</Heading>
        <Flex justify="space-between" align="baseline" my={2}>
          <Box>
            <Text fontSize="xs" color="gray.500">Your Bid</Text>
            <Text fontWeight="bold" fontSize="lg">{formatToLKR(myHighestBid)}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Current Bid</Text>
            <Text fontWeight="bold" color="primary.500" fontSize="lg">{formatToLKR(currentBid)}</Text>
          </Box>
        </Flex>
        <Flex justify="space-between" align="center" mt={3}>
          <Tag colorScheme={statusColorScheme} size="md">{statusText}</Tag>
          <Button
            as={RouterLink}
            to={`/auctions/${auction.propertyId}`}
            size="sm"
            colorScheme="secondary"
          >
            Go to Auction
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default MyBidCard;