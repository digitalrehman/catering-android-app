import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store/authSlice';
import COLORS from '../utils/colors';

const Dashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.Data.currentData);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi {user?.name || 'Guest'},</Text>
            <Text style={styles.subtext}>Welcome back to Unites Catering</Text>
          </View>

          <TouchableOpacity>
            <View style={styles.profileIconContainer}>
              <Icon name="account-circle" size={42} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 🔝 Top Action Row */}
        <View style={styles.topActionRow}>
          {/* Left Icons */}
          <View style={styles.leftIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Icon name="plus-circle" size={24} color={COLORS.WHITE} />
              <Text style={styles.iconLabel}>Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Quotation')}>
              <Icon name="calendar-month-outline" size={24} color={COLORS.WHITE} />
              <Text style={styles.iconLabel}>Calendar</Text>
            </TouchableOpacity>
          </View>

          {/* Right Icons */}
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="bell-outline" size={22} color={COLORS.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={() => dispatch(setLogout())}>
              <Icon name="logout" size={22} color={COLORS.ACCENT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Today’s Orders</Text>
          <Text style={styles.cardSubtitle}>Catering & Event Services</Text>

          {/* Two Half Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.ACCENT }]}>
              <Icon name="check-circle" size={20} color={COLORS.BLACK} />
              <Text style={[styles.btnText, { color: COLORS.BLACK }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="clock-outline" size={20} color={COLORS.WHITE} />
              <Text style={[styles.btnText, { color: COLORS.WHITE }]}>Tentative</Text>
            </TouchableOpacity>
          </View>

        
        </Animated.View>

        {/* Monthly Stats */}
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <Animated.View
          style={[
            styles.statsGrid,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>22</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: '700',
  },
  subtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 3,
  },
  profileIconContainer: {
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
    borderRadius: 50,
    padding: 2,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    alignItems: 'center',
  },
  iconLabel: {
    color: COLORS.WHITE,
    fontSize: 10,
    marginTop: 3,
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 8,
    borderRadius: 25,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  cardTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: '48%',
    paddingVertical: 10,
    gap: 6,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    color: COLORS.ACCENT,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    width: '47%',
    paddingVertical: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 5,
  },
});
