import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
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
      Toast.show({ type: 'error', text1: 'Please enter your username or email' });
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
    <ImageBackground
      source={require('../assets/images/main.jpg')} // 🔥 Background image
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Red dark overlay */}
      <LinearGradient
        colors={['rgba(150,0,0,0.6)', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={{ marginTop: 60 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      >
        {/* Logo Animation */}
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
            style={styles.logo}
          />
        </Animated.View>

        {/* Title */}
        <View style={{ alignItems: 'center', marginBottom: 25 }}>
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
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={22} color="#990303" />
            <View style={styles.separator} />
            <TextInput
              placeholder="Email or Username"
              placeholderTextColor="#999"
              style={styles.input}
              onChangeText={setUsername}
              value={username}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={22} color="#990303" />
            <View style={styles.separator} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={styles.input}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#990303"
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
              <ActivityIndicator color="#800000" />
            ) : (
              <LinearGradient
                colors={['#b30000', '#800000']}
                style={styles.gradientBtn}
              >
                <Text style={styles.text}>Login</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            © 2025 Unites Catering Services. All Rights Reserved.
          </Text>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 130,
    width: 230,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 20,
    tintColor: '#FFD700',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    color: '#f5f5f5',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: '90%',
    alignSelf: 'center',
    padding: 25,
    borderRadius: 18,
    elevation: 8,
    shadowColor: '#800000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  separator: {
    width: 1,
    height: 25,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    paddingVertical: 10,
  },
  gradientBtn: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  text: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 25,
    color: 'gray',
    fontSize: 13,
  },
});
