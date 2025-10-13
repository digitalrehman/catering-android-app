import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnnouncementSection = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://cat.de2solutions.com/mobile_dash/event_annoucment.php')
      .then(res => res.json())
      .then(data => {
        setAnnouncement(data.annoucment_data);
      })
      .catch(err => console.error('API Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const announcementArray = announcement
    ? [
        {
          id: 1,
          title: 'Today Event',
          confirm: announcement.today_confirm,
          tentative: announcement.today_tentative,
        },
        {
          id: 2,
          title: 'Tomorrow Event',
          confirm: announcement.tomorrow_confirm,
          tentative: announcement.tomorrow_tentative,
        },
        {
          id: 3,
          title: 'Current Month',
          confirm: announcement.current_month_confirm,
          tentative: announcement.current_month_tentative,
        },
        {
          id: 4,
          title: 'Current Year',
          confirm: announcement.current_year_confirm,
          tentative: announcement.current_year_tentative,
        },
        {
          id: 5,
          title: 'Onward',
          confirm: announcement.onward_confirm,
          tentative: announcement.onward_tentative,
        },
      ]
    : [];

  const renderAnnouncementCard = ({ item }) => (
    <LinearGradient
      colors={['#B83232', '#4A0000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.announcementCard}
    >
      <View style={styles.titleRow}>
        <Icon name="bullhorn-outline" size={22} color="#FFD700" style={{ marginRight: 6 }} />
        <Text style={styles.announceTitle}>{item.title}</Text>
      </View>

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

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#FFD700" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.announceHeaderRow}>
        <Icon name="bullhorn-outline" size={22} color="#FFD700" />
        <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Announcements</Text>
      </View>

      <FlatList
        data={announcementArray}
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
    </View>
  );
};

export default AnnouncementSection;

const styles = StyleSheet.create({
  announceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: { color: '#FFD700', fontSize: 18, fontWeight: '700' },
  announcementCard: {
    width: 250,
    borderRadius: 18,
    padding: 18,
    marginRight: 15,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  announceTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  announceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  circleBox: { alignItems: 'center', justifyContent: 'center' },
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
  circleText: { color: '#FFD700', fontSize: 20, fontWeight: '800' },
  circleLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
