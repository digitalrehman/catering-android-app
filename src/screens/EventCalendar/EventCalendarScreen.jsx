// EventCalendarScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';

const EventCalendarScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current; // for light->dark effect
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // opening animation: fade in + overlay from light -> dark
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Demo events with profile image (put these images in ../assets/images/)
    const dummy = [
      {
        id: '1',
        name: 'Bruno Mars Concert',
        date: '2025-11-08',
        location: 'Birmingham, UK',
        seats: '2 seats',
        time: '8:00 pm',
        image: require('../../assets/images/profile.png'),
      },
      {
        id: '2',
        name: 'Anne Marie Show',
        date: '2025-11-14',
        location: 'New York, USA',
        seats: '3 seats',
        time: '7:30 pm',
        image: require('../../assets/images/profile.png'),
      },
      {
        id: '3',
        name: 'Charlie Puth Live',
        date: '2025-11-20',
        location: 'Kyoto, Japan',
        seats: '4 seats',
        time: '9:00 pm',
        image: require('../../assets/images/profile.png'),
      },
      // placeholder event for today example
      {
        id: '4',
        name: 'Local Tasting',
        date: today,
        location: 'Karachi, PK',
        seats: '1 seat',
        time: '6:00 pm',
        image: require('../../assets/images/profile.png'),
      },
    ];

    setEvents(dummy);
    setFilteredEvents(dummy);

    // mark dates: today selected and events dotted
    const marked = {};
    marked[today] = { selected: true, selectedColor: '#FFD700' };
    dummy.forEach(ev => {
      if (marked[ev.date]) {
        // if today and event: show selected + dot
        marked[ev.date] = {
          selected: marked[ev.date].selected,
          selectedColor: '#FFD700',
          marked: true,
          dotColor: '#FFD700',
        };
      } else {
        marked[ev.date] = { marked: true, dotColor: '#FFD700' };
      }
    });
    setMarkedDates(marked);
  }, []);

  const onDayPress = day => {
    // filter events by selected day
    const date = day.dateString;
    const filtered = events.filter(e => e.date === date);
    if (filtered.length === 0) {
      // show all if none match (or you can keep empty)
      setFilteredEvents(events);
      Alert.alert(
        'No events',
        'No events on selected date. Showing all events.',
      );
    } else {
      setFilteredEvents(filtered);
    }

    // update markedDates visually: keep selected
    const newMarked = { ...markedDates };
    // clear previous selected flags
    Object.keys(newMarked).forEach(k => {
      if (newMarked[k].selected) newMarked[k].selected = false;
    });
    newMarked[date] = {
      ...(newMarked[date] || {}),
      selected: true,
      selectedColor: '#FFD700',
    };
    setMarkedDates(newMarked);
  };

  const renderEventCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('EventDetail', {
            event: item,
          })
        }
      >
        <LinearGradient
          colors={['#B83232', '#990303']}
          style={styles.cardInner}
        >
          <View style={styles.cardRow}>
            <Image source={item.image} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.row}>
                <Icon name="calendar-month" size={16} color="#FFD700" />
                <Text style={styles.infoText}>
                  {item.date} • {item.time}
                </Text>
              </View>
              <View style={styles.row}>
                <Icon name="map-marker" size={16} color="#FFD700" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
            </View>
            <View style={styles.chevWrap}>
              <Icon name="chevron-right" size={22} color="#FFD700" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#B83232', '#4A0000']} style={styles.container}>
      {/* animated overlay from light -> dark */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#ffffff',
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 0],
            }), // initial light tint then remove so page appears to darken underneath
          },
        ]}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <AppHeader title="View Calendar" />

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

        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </LinearGradient>
  );
};

export default EventCalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginLeft: 18,
    marginBottom: 8,
  },
  card: { marginBottom: 12, borderRadius: 14, overflow: 'hidden' },
  cardInner: { padding: 12, borderRadius: 14, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 10, resizeMode: 'cover' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { color: '#FFD700', fontSize: 13, marginLeft: 8 },
  chevWrap: { width: 36, alignItems: 'center', justifyContent: 'center' },
});
