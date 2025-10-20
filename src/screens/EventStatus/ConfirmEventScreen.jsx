import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EventCard from '../../components/EventCard';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { handleDirectShare } from '../../utils/pdfShare';

const ConfirmEventScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchConfirmEvents();
  }, []);

  const fetchEventDetails = async orderNo => {
    try {
      const formData = new FormData();
      formData.append('order_no', orderNo);

      const response = await fetch(
        'https://cat.de2solutions.com/mobile_dash/get_event_food_decor_detail.php',
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();

      const eventDetails = {
        food: data.status_food === 'true' ? data.data_food || [] : [],
        beverages:
          data.status_beverages === 'true' ? data.data_beverages || [] : [],
        decoration:
          data.status_decoration === 'true' ? data.data_decoration || [] : [],
        services: [],
      };

      return eventDetails;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return { food: [], beverages: [], decoration: [], services: [] };
    }
  };

  const fetchConfirmEvents = async () => {
    try {
      const response = await fetch(
        'https://cat.de2solutions.com/mobile_dash/get_event_quotation_confirm.php',
      );
      const data = await response.json();

      if (data.status === 'true') {
        const formatted = data.data.map((event, i) => ({
          id: event.order_no || String(i + 1),
          name: event.name || 'N/A',
          contact_no: event.contact_no || 'N/A',
          guest: event.guest || 'N/A',
          venue: event.venue || 'N/A',
          function_code: event.function_code || 'N/A',
          total: event.total || '0',
          advance: event.advance || '0',
          date: event.function_date || '',
          time: event.time || '',
          image: require('../../assets/images/profile.png'),
          originalData: event,
        }));
        setEvents(formatted);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching confirm events:', error);
      Toast.show({ type: 'error', text1: 'Failed to load events' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = event => {
    navigation.navigate('Quotation', { eventData: event });
  };

  return (
    <LinearGradient colors={['#B83232', '#4A0000']} style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AppHeader title="Confirm Events" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.text}>Loading Confirmed Events...</Text>
        </View>
      ) : events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onShare={event => handleDirectShare(event, fetchEventDetails)}
              onEdit={handleEdit}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        />
      ) : (
        <View style={styles.center}>
          <Icon name="calendar-remove" size={60} color="#FFD700" />
          <Text style={styles.text}>No Confirmed Events Found</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default ConfirmEventScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
