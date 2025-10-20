import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.log('🚨 APP CRASH DETAILS:', error, errorInfo);
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.error}>{this.state.error?.toString()}</Text>
          <Text style={styles.details}>
            {this.state.errorInfo?.componentStack}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#ff3b30'
  },
  error: { 
    color: 'red', 
    marginBottom: 10,
    textAlign: 'center'
  },
  details: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 8 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16 
  }
});

export default ErrorBoundary;