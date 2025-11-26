// src/components/user/PropertyList.jsx
import React from 'react';
import { SimpleGrid, Flex, Text, Box } from '@chakra-ui/react';
import PropertyCard from './PropertyCard'; // Corrected: PropertyCard is in the same directory

const PropertyList = ({ properties }) => {
  // Handle the case where properties array is empty or undefined
  if (!properties || properties.length === 0) {
    return (
      <Flex
        minHeight={{ base: "200px", md: "300px" }}
        width="100%"
        justifyContent="center"
        alignItems="center"
        py={10}
      >
        <Text fontSize="xl" color="gray.500" textAlign="center">
          No properties available at the moment.
        </Text>
      </Flex>
    );
  }

  // Render a grid of PropertyCard components
  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, md: 3 }}
      spacing={{ base: 4, md: 6 }}
      width="100%"
      py={4}
    >
      {properties.map((property) => (
        <PropertyCard key={property._id || property.id} property={property} />
      ))}
    </SimpleGrid>
  );
};

export default PropertyList;