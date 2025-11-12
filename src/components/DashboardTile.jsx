import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../utils/colors';

const DashboardTile = ({ icon, label, onPress }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressAnim }], width: '47%' }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.card}
      >
        <LinearGradient
          colors={['rgba(255,214,0,0.15)', 'rgba(255,255,255,0.08)']} // Direct rgba for yellow
          style={styles.gradient}
        >
          <Icon name={icon} size={30} color={COLORS.ACCENT} />
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DashboardTile;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 15,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});