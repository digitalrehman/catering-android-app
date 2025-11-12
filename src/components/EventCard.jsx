import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../utils/colors';

const EventCard = ({ item, onShare, onEdit }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.cardInner}>
        <View style={styles.cardRow}>
          <Image source={item.image} style={styles.avatar} />
          <View style={styles.cardContent}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.row}>
              <Icon name="phone" size={12} color={COLORS.ACCENT} />
              <Text style={styles.infoText}>{item.contact_no}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="account-group" size={12} color={COLORS.ACCENT} />
              <Text style={styles.infoText}>{item.guest} Guests</Text>
            </View>
            <View style={styles.row}>
              <Icon name="map-marker" size={12} color={COLORS.ACCENT} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.venue}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onShare(item)}
            >
              <Icon name="share-variant" size={18} color={COLORS.ACCENT} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <Icon name="pencil" size={18} color={COLORS.ACCENT} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 2,
    height: 90,
  },
  cardInner: {
    padding: 8,
    borderRadius: 12,
    elevation: 3,
    height: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'space-between',
    height: '100%',
  },
  name: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  infoText: {
    color: COLORS.ACCENT,
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  actionsContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 2,
  },
  actionButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,214,0,0.1)',
    marginBottom: 4,
  },
});