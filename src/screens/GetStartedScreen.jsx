import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../utils/colors';

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

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
        {/* Darker Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.9)',  // top very dark
            'rgba(0,0,0,0.6)',  // mid
            'rgba(0,0,0,0.3)',  // bottom light
          ]}
          style={styles.overlay}
        >
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            
            {/* Heading Section */}
            <View style={styles.topContainer}>
              <Text style={styles.title}>CND Services</Text>
              <Text style={styles.subtitle}>
                Serving Excellence with Every Meal
              </Text>
            </View>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
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

          </Animated.View>
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
    paddingHorizontal: 25,
    paddingVertical: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    opacity: 0.95,
    textAlign: 'center',
  },
  bottomContainer: {
    width: '100%',
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
