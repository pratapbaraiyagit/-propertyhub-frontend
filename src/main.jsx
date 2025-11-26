// src/main.jsx
import React from 'react'; 
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; // Use the centralized theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}> {/* Use your custom theme if you have one */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)

