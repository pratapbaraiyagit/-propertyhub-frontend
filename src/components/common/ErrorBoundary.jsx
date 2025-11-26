import React, { Component } from 'react';
import { Text } from '@chakra-ui/react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Text>Failed to load notifications.</Text>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
