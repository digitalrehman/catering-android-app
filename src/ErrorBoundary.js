import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('APP CRASH DETAILS:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={60} color="#FF3B30" />
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.subtitle}>
            Don’t worry — this isn’t your fault. You can try again.
          </Text>

          {/* 🔹 Show Short Error */}
          {this.state.error && (
            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
          )}

          {/* 🔹 Collapsible Error Details */}
          <ScrollView style={styles.scrollArea}>
            <Text style={styles.errorDetails}>
              {this.state.errorInfo?.componentStack}
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Ionicons name="refresh" size={18} color="#fff" />
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
    backgroundColor: '#1a1c22',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 120,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#999',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ErrorBoundary;
