import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store/authSlice';
import DashboardTile from '../components/DashboardTile';
import COLORS from '../utils/colors';

const Dashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.Data.currentData);

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
  }, []);

  const AnimatedTouchable = ({ onPress, children }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;
    return (
      <Animated.View
        style={{ transform: [{ scale: pressAnim }], width: '47%' }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={() =>
            Animated.spring(pressAnim, {
              toValue: 0.96,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(pressAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start()
          }
          onPress={onPress}
          style={styles.statCard}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const announcements = [
    { id: 1, title: 'Today Event', confirm: 4, tentative: 2 },
    { id: 2, title: 'Tomorrow Event', confirm: 3, tentative: 1 },
    { id: 3, title: 'This Week Event', confirm: 7, tentative: 3 },
    { id: 4, title: 'This Month Event', confirm: 12, tentative: 5 },
    { id: 5, title: 'Next Month Event', confirm: 9, tentative: 4 },
  ];

  const renderAnnouncementCard = ({ item }) => (
    <LinearGradient
      colors={['#B83232', '#4A0000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.announcementCard}
    >
      {/* Title with Event Icon */}
      <View style={styles.titleRow}>
        <Icon
          name="bullhorn-outline"
          size={22}
          color="#FFD700"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.announceTitle}>{item.title}</Text>
      </View>

      {/* Confirm & Tentative Counts */}
      <View style={styles.announceRow}>
        <View style={styles.circleBox}>
          <View style={styles.countCircle}>
            <Text style={styles.circleText}>{item.confirm}</Text>
          </View>
          <Text style={styles.circleLabel}>Confirm</Text>
        </View>

        <View style={styles.circleBox}>
          <View style={styles.countCircle}>
            <Text style={styles.circleText}>{item.tentative}</Text>
          </View>
          <Text style={styles.circleLabel}>Tentative</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#B83232', '#4A0000']} // 🔥 Full theme: same as announcement cards
      style={styles.container}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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
              style={[styles.actionBtn, { backgroundColor: '#FFD700' }]}
            >
              <Icon name="check-circle" size={20} color="#990303" />
              <Text style={[styles.btnText, { color: '#990303' }]}>
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
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

        {/* Announcements */}
        <View style={styles.announceHeaderRow}>
          <Icon name="bullhorn-outline" size={22} color="#FFD700" />
          <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
            Announcements
          </Text>
        </View>

        <FlatList
          data={announcements}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 20,
            paddingRight: 10,
            paddingVertical: 10,
          }}
          renderItem={renderAnnouncementCard}
        />
        <View style={{ height: 30 }} />
      </ScrollView>
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
  statCard: { borderRadius: 18, marginBottom: 15, overflow: 'hidden' },
  gradientBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statText: { color: '#FFD700', fontSize: 14, fontWeight: '600', marginTop: 8 },
  announceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: { color: '#FFD700', fontSize: 18, fontWeight: '700' },
  announcementCard: {
    width: 220,
    borderRadius: 18,
    padding: 18,
    marginRight: 15,
    // 🔥 soft glow + subtle shadow for premium look
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  announceTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  announceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  announceTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  announceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  circleBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircle: {
    width: 55,
    height: 55,
    borderRadius: 55,
    backgroundColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    marginBottom: 6,
  },
  circleText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '800',
  },
  circleLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
