import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Text, VStack } from '@chakra-ui/react';
import CountdownTimer from './CountdownTimer';

export default function AuctionPopup({ isOpen, onClose, auction, onBid }) {
  if (!auction) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{auction.propertyTitle} - Auction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            <Text><b>Status:</b> {auction.status}</Text>
            <Text><b>Current Bid:</b> LKR {auction.currentBid} M</Text>
            <Text><b>Ends In:</b> <CountdownTimer endTime={auction.endTime} /></Text>
            <Text><b>Start Time:</b> {new Date(auction.startTime).toLocaleString()}</Text>
            <Text><b>End Time:</b> {new Date(auction.endTime).toLocaleString()}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="secondary" onClick={onBid} isDisabled={auction.status !== 'Live'}>Bid</Button>
          <Button variant="ghost" ml={3} onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
