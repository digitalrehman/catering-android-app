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
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store/authSlice';
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
    { id: 1, title: 'Today', confirm: 4, tentative: 2 },
    { id: 2, title: 'Tomorrow', confirm: 3, tentative: 1 },
    { id: 3, title: 'This Week', confirm: 7, tentative: 3 },
    { id: 4, title: 'This Month', confirm: 12, tentative: 5 },
    { id: 5, title: 'Next Month', confirm: 9, tentative: 4 },
  ];

  const renderAnnouncementCard = ({ item }) => (
    <LinearGradient
      colors={[COLORS.ACCENT, COLORS.ACCENT_DARK]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.announcementCard}
    >
      <Text style={styles.announceTitle}>{item.title}</Text>
      <View style={styles.announceRow}>
        <View style={styles.miniBox}>
          <Icon name="check-circle" size={26} color={COLORS.WHITE} />
          <Text style={styles.miniLabel}>Confirm</Text>
          <Text style={styles.miniNumber}>{item.confirm}</Text>
        </View>

        <View style={styles.miniBox}>
          <Icon name="clock-outline" size={26} color={COLORS.WHITE} />
          <Text style={styles.miniLabel}>Tentative</Text>
          <Text style={styles.miniNumber}>{item.tentative}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.container}>
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
            <Text style={styles.subtext}>Welcome back to United Catering</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="bell-outline" size={22} color={COLORS.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconCircle,
                { backgroundColor: COLORS.ACCENT_DARK },
              ]}
              onPress={() => dispatch(setLogout())}
            >
              <Icon name="logout" size={22} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Events Status */}
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.cardTitle}>Events Status</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.ACCENT }]}
            >
              <Icon name="check-circle" size={20} color={COLORS.BLACK} />
              <Text style={[styles.btnText, { color: COLORS.BLACK }]}>
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Icon name="clock-outline" size={20} color={COLORS.WHITE} />
              <Text style={[styles.btnText, { color: COLORS.WHITE }]}>
                Tentative
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.newActionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Quotation')}
            >
              <Icon name="plus-circle" size={26} color={COLORS.ACCENT} />
              <Text style={styles.newIconLabel}>New Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Icon
                name="calendar-month-outline"
                size={26}
                color={COLORS.ACCENT}
              />
              <Text style={styles.newIconLabel}>Calendar View</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Monthly Overview */}
        <Animated.View
          style={[
            styles.statsGrid,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <AnimatedTouchable onPress={() => navigation.navigate('Management')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
              style={styles.gradientBox}
            >
              <Icon
                name="account-tie-outline"
                size={30}
                color={COLORS.ACCENT}
              />
              <Text style={styles.statText}>Management</Text>
            </LinearGradient>
          </AnimatedTouchable>
          <AnimatedTouchable onPress={() => navigation.navigate('Sales')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
              style={styles.gradientBox}
            >
              <Icon name="cash-multiple" size={30} color={COLORS.ACCENT} />
              <Text style={styles.statText}>Sales</Text>
            </LinearGradient>
          </AnimatedTouchable>
          <AnimatedTouchable onPress={() => navigation.navigate('Kitchen')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
              style={styles.gradientBox}
            >
              <Icon name="chef-hat" size={30} color={COLORS.ACCENT} />
              <Text style={styles.statText}>Kitchen</Text>
            </LinearGradient>
          </AnimatedTouchable>
          <AnimatedTouchable onPress={() => navigation.navigate('Pending')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
              style={styles.gradientBox}
            >
              <Icon name="progress-clock" size={30} color={COLORS.ACCENT} />
              <Text style={styles.statText}>Pending</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </Animated.View>

        {/* Announcements */}
        <View style={styles.announceHeaderRow}>
          <Icon name="bullhorn-outline" size={22} color={COLORS.ACCENT} />
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
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + 10 || 40,
  },
  greeting: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '700',
  },
  subtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 3,
  },
  headerRightIcons: { flexDirection: 'row', gap: 12 },
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
    marginHorizontal: 20,
  },
  cardTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
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
    color: COLORS.ACCENT,
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
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  announceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  announcementCard: {
    width: 220,
    borderRadius: 18,
    padding: 18,
    marginRight: 15,
  },
  announceTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  announceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // elevation: 3,
  },
  miniLabel: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  miniNumber: {
    color: COLORS.WHITE,
    fontSize: 11,
    marginTop: 2,
  },
});
