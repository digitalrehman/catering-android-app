import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../utils/colors';
import api from '../utils/api';
import { CurrentLogin, setLoader } from '../store/authSlice';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const Loading = useSelector(state => state.Data.Loading);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loginUser = async () => {
    if (!username.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter your username or email',
      });
      return;
    } else if (!password.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your password' });
      return;
    }

    dispatch(setLoader(true));

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${api.baseURL}users.php`,
      headers: {},
    };

    try {
      const res = await dispatch(CurrentLogin({ config, username, password }));
      dispatch(setLoader(false));

      if (res.payload) {
        Toast.show({
          type: 'success',
          text1: 'Login successful!',
          visibilityTime: 1500,
        });
        navigation.replace('Dashboard');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid credentials',
          text2: 'Your username or password is incorrect',
        });
      }
    } catch (err) {
      dispatch(setLoader(false));
      Toast.show({
        type: 'error',
        text1: 'Network error',
        text2: 'Please check your internet connection',
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Main Background Gradient */}
      <LinearGradient
        colors={['#3B0B0E', '#B83232', '#990303']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Transparent Overlay for Depth Effect */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(255,255,255,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={{ marginTop: 60 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      >
        {/* Logo */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={{
              height: 130,
              width: 230,
              alignSelf: 'center',
              resizeMode: 'contain',
              marginBottom: 25,
              filter: 'invert(1)',
            }}
          />
        </Animated.View>

        {/* Title */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={styles.titleText}>Welcome to UCS</Text>
          <Text style={styles.subtitleText}>
            Delivering Taste & Quality Every Time
          </Text>
        </View>

        {/* Login Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={22} color="rgba(0,0,0,0.6)" />
            <View style={styles.separator} />
            <TextInput
              placeholder="Email or Username"
              placeholderTextColor="rgba(0,0,0,0.5)"
              style={styles.input}
              onChangeText={setUsername}
              value={username}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={22} color="rgba(0,0,0,0.6)" />
            <View style={styles.separator} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(0,0,0,0.5)"
              secureTextEntry={!showPassword}
              style={styles.input}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="rgba(0,0,0,0.6)"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, { opacity: Loading ? 0.7 : 1 }]}
            onPress={loginUser}
            disabled={Loading}
          >
            {Loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.text}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            © 2025 Unites Catering Services. All Rights Reserved.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#C89647',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    color: '#C89647',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    padding: 25,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  separator: {
    width: 1,
    height: 25,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#C62828',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 6,
  },
  text: {
    color: '#C89647',
    fontSize: 17,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#888',
    fontSize: 13,
  },
});
