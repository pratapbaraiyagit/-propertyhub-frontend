import React from 'react';

const PropertyCard = ({ title, image, price, location }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '300px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
        <img
            src={image}
            alt={title}
            style={{ width: '100%', borderRadius: '6px', marginBottom: '12px' }}
        />
        <h3>{title}</h3>
        <p>{location}</p>
        <strong>${price}</strong>
    </div>
);

PropertyCard.defaultProps = {
    title: 'No Title',
    image: 'https://via.placeholder.com/300x200?text=No+Image',
    price: 'N/A',
    location: 'Unknown Location'
};

export default PropertyCard;