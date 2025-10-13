import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';

const KitchenScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();

    const dummyEvents = [
      { id: 1, name: 'Wedding', date: today },
      { id: 2, name: 'Corporate Lunch', date: '2025-11-15' },
      { id: 3, name: 'Birthday Party', date: '2025-11-20' },
    ];

    setEvents(dummyEvents);

    const marks = {};
    dummyEvents.forEach(e => {
      marks[e.date] = { marked: true, dotColor: '#FFD700' };
    });
    marks[today] = { ...marks[today], selected: true, selectedColor: '#FFD700' };
    setMarkedDates(marks);
  }, []);

  const onDayPress = day => {
    const date = day.dateString;
    const hasEvent = events.some(e => e.date === date);

    if (!hasEvent) {
      Alert.alert('No event', 'No event on this date.');
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }

    const newMarks = { ...markedDates };
    Object.keys(newMarks).forEach(k => (newMarks[k].selected = false));
    newMarks[date] = {
      ...(newMarks[date] || {}),
      selected: true,
      selectedColor: '#FFD700',
    };
    setMarkedDates(newMarks);
  };

  const buttons = [
    { label: 'HF', icon: 'home', screen: 'HF' },
    { label: 'Kitchen', icon: 'silverware-fork-knife', screen: 'KitchenDetail' },
    { label: 'Office', icon: 'office-building', screen: 'OfficeScreen' },
    { label: 'Gatepass', icon: 'gate', screen: 'GatepassScreen' },
  ];

  return (
    <LinearGradient colors={['#B83232', '#4A0000']} style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#ffffff',
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 0],
            }),
          },
        ]}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <AppHeader title="Kitchen Calendar" />

        <View style={styles.calendarContainer}>
          <Calendar
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: '#fff',
              monthTextColor: '#FFD700',
              todayTextColor: '#990303',
              arrowColor: '#FFD700',
              textDisabledColor: 'rgba(255,255,255,0.35)',
              selectedDayBackgroundColor: '#FFD700',
              selectedDayTextColor: '#000',
              dotColor: '#FFD700',
            }}
            markedDates={markedDates}
            onDayPress={onDayPress}
            hideExtraDays={false}
            firstDay={1}
            enableSwipeMonths
          />
        </View>

        {/* Bottom Button Cards */}
        {selectedDate && (
          <View style={styles.cardGrid}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cardWrapper}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(btn.screen)}
              >
                <LinearGradient
                  colors={['#ff5555', '#8B0000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <Icon name={btn.icon} size={28} color="#FFD700" />
                  <Text style={styles.cardText}>{btn.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

export default KitchenScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarContainer: { marginTop: 10 },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 25,
  },
  cardWrapper: {
    width: '45%',
    marginVertical: 10,
  },
  card: {
    height: 110,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  cardText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
  },
});
