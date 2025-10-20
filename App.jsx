import React from 'react';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { Store } from './src/store/store';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/routes/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import ErrorBoundary from './src/ErrorBoundary';

const App = () => {
  return (
    <Provider store={Store}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ErrorBoundary>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaView>
      <Toast />
    </Provider>
  );
};

export default App;