import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { useDispatch } from 'react-redux';
import { setLogout } from '../store/authSlice';
import DashboardTile from '../components/DashboardTile';
import AnnouncementSection from '../components/AnnouncementSection';

const Dashboard = ({ navigation }) => {
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const screenAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#B83232', '#4A0000']} style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.View
        style={{
          flex: 1,
          opacity: screenAnim,
          transform: [{ scale: screenAnim }],
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>United Catering</Text>
              <Text style={styles.subtext}>Delivering Taste & Quality</Text>
            </View>
            <View style={styles.headerRightIcons}>
              <TouchableOpacity style={styles.iconCircle}>
                <Icon name="bell-outline" size={22} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconCircle,
                  { backgroundColor: 'rgba(255,215,0,0.1)' },
                ]}
                onPress={() => dispatch(setLogout())}
              >
                <Icon2 name="logout" size={22} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Status */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Events Status</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ConfirmEventScreen')}
                style={[styles.actionBtn, { backgroundColor: '#FFD700' }]}
              >
                <Icon name="check-circle" size={20} color="#990303" />
                <Text style={[styles.btnText, { color: '#990303' }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('TentativeScreen')}
                style={[
                  styles.actionBtn,
                  { backgroundColor: 'rgba(255,255,255,0.1)' },
                ]}
              >
                <Icon name="clock-outline" size={20} color="#FFD700" />
                <Text style={[styles.btnText, { color: '#FFD700' }]}>
                  Tentative
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.newActionRow}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Quotation')}
              >
                <Icon name="plus-circle" size={26} color="#FFD700" />
                <Text style={styles.newIconLabel}>New Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('EventCalendar')}
              >
                <Icon name="calendar-month-outline" size={26} color="#FFD700" />
                <Text style={styles.newIconLabel}>Calendar View</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Main Options */}
          <Animated.View
            style={[
              styles.statsGrid,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <DashboardTile
              icon="account-tie-outline"
              label="Management"
              onPress={() => navigation.navigate('Management')}
            />
            <DashboardTile
              icon="cash-multiple"
              label="Sales"
              onPress={() => navigation.navigate('Sales')}
            />
            <DashboardTile
              icon="chef-hat"
              label="Kitchen"
              onPress={() => navigation.navigate('Kitchen')}
            />
            <DashboardTile
              icon="progress-clock"
              label="Pending"
              onPress={() => navigation.navigate('Pending')}
            />
          </Animated.View>

          <View style={{ height: 40 }} />

          {/* Announcements Section */}
          <AnnouncementSection />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight - 15 || 20,
    marginBottom: 20,
  },
  greeting: { color: '#FFD700', fontSize: 20, fontWeight: '700' },
  subtext: { color: '#fff', fontSize: 12, marginTop: 3 },
  headerRightIcons: { flexDirection: 'row', gap: 12 },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 25,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    marginHorizontal: 20,
  },
  cardTitle: { color: '#FFD700', fontSize: 18, fontWeight: '700' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
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
  btnText: { fontSize: 14, fontWeight: '600' },
  newActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  newIconLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  iconBtn: { alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
