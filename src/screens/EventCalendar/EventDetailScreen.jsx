// EventDetailScreen.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!event) {
    return (
      <LinearGradient colors={['#B83232', '#4A0000']} style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View style={styles.center}>
          <Text style={{ color: '#fff' }}>No event data</Text>
        </View>
      </LinearGradient>
    );
  }

  const handleConfirm = () => {
    Alert.alert('Confirmed', `${event.name} has been confirmed.`);
    navigation.goBack();
  };

  const handleTentative = () => {
    Alert.alert('Tentative', `${event.name} set as tentative.`);
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#9B111E', '#4A0000']} style={styles.container}>
      <AppHeader title="Event Overview" />

      <Animated.ScrollView
        style={[
          styles.scrollContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Info Card */}
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
          style={styles.topCard}
        >
          <Image source={event.image} style={styles.topAvatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.topName}>{event.name}</Text>
            <View style={styles.row}>
              <Icon name="calendar-month" size={16} color="#FFD700" />
              <Text style={styles.topInfo}>{event.date}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="map-marker" size={16} color="#FFD700" />
              <Text style={styles.topInfo}>{event.location}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Details */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{event.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Place</Text>
            <Text style={styles.value}>{event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Seats</Text>
            <Text style={styles.value}>{event.seats || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{event.time || 'N/A'}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tentativeBtn}
              onPress={handleTentative}
            >
              <Text style={styles.tentativeText}>Tentative</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    marginHorizontal: 0,
    paddingVertical: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexGrow: 1,
  },

  topCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  topAvatar: { width: 80, height: 80, borderRadius: 14 },
  topName: { color: '#fff', fontSize: 19, fontWeight: '800' },
  topInfo: { color: '#FFD700', fontSize: 13, marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 6,
  },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  value: { color: '#fff', fontSize: 13, fontWeight: '700' },

  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  confirmText: { color: '#4A0000', fontWeight: '700', fontSize: 15 },
  tentativeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  tentativeText: { color: '#FFD700', fontWeight: '700', fontSize: 15 },
});
