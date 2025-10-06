import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../utils/colors';

const GetStartedScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/main.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0, 0, 0, 0.46)', 'rgba(0,0,0,0.9)']}
          style={styles.overlay}
        >
          {/* Bottom Content */}
          <View style={styles.bottomContainer}>
            <Text style={styles.title}>Unites Catering Services</Text>
            <Text style={styles.subtitle}>
              Serving Excellence with Every Meal
            </Text>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('login')}
            >
              <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.gradientBtn}
              >
                <Text style={styles.btnText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // push content to bottom
    paddingHorizontal: 25,
    paddingBottom: 50,
  },
  bottomContainer: {
    width: '100%',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    opacity: 0.9,
    textAlign: 'left',
    marginBottom: 35,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
