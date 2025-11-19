// EventDetailScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Alert,
  Linking,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import COLORS from '../../utils/colors';

const EventDetailScreen = () => {
  const route = useRoute();
  const { event } = route.params || {};
  console.log('event', event);
  
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const handleCall = number => {
    if (!number) return;
    const phoneNumber = `tel:${number}`;
    Linking.openURL(phoneNumber).catch(err =>
      console.error('Failed to open dialer:', err),
    );
  };

// Fetch food data
const fetchFoodData = async () => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append('order_no', event.id); // Using event.id as order_no from params

    console.log('Sending order_no:', event.id);

    const response = await fetch(
      'https://cat.de2solutions.com/mobile_dash/get_event_food_decor_detail.php',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Food API Response:', data);
    
    if (data.status_food === 'true' || data.status_beverages === 'true' || data.status_decoration === 'true') {
      setFoodData(data);
    } else {
      setFoodData(null);
    }
  } catch (error) {
    console.error('Error fetching food data:', error);
    Alert.alert('Error', `Failed to fetch food items data: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch food data when component mounts
    if (event && event.id) {
      fetchFoodData();
    }
  }, [event]);

  if (!event) {
    return (
      <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View style={styles.center}>
          <Text style={{ color: COLORS.WHITE }}>No event data</Text>
        </View>
      </LinearGradient>
    );
  }

  // Calculate remaining amount
  const total = parseFloat(event.total) || 0;
  const advance = parseFloat(event.advance) || 0;
  const remaining = total - advance;

  const handleConfirm = () => {
    Alert.alert('Confirmed', `${event.name} has been confirmed.`);
  };

  const handleTentative = () => {
    Alert.alert('Tentative', `${event.name} set as tentative.`);
  };

  // Render food items
  const renderFoodItems = () => {
    if (loading) {
      return (
        <View style={styles.foodSection}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          <Text style={styles.loadingText}>Loading food items...</Text>
        </View>
      );
    }

    if (!foodData) {
      return (
        <View style={styles.foodSection}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          <Text style={styles.noDataText}>No food items data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.foodSection}>
        <Text style={styles.sectionTitle}>Food Items</Text>

        {/* Food Items */}
        {foodData.status_food === 'true' && foodData.data_food && foodData.data_food.length > 0 && (
          <View style={styles.foodCategory}>
            <Text style={styles.categoryTitle}>Food</Text>
            {foodData.data_food.map((item, index) => (
              <View key={item.id || index} style={styles.foodItem}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                  <Text style={styles.foodPrice}>Rs. {parseFloat(item.unit_price || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.foodDetails}>
                  <Text style={styles.foodDetailText}>Stock Code: {item.stk_code}</Text>
                  <Text style={styles.foodDetailText}>Quantity: {item.quantity}</Text>
                  <Text style={styles.foodDetailText}>Delivered: {item.delivered_qty}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Beverages */}
        {foodData.status_beverages === 'true' && foodData.data_beverages && foodData.data_beverages.length > 0 && (
          <View style={styles.foodCategory}>
            <Text style={styles.categoryTitle}>Beverages</Text>
            {foodData.data_beverages.map((item, index) => (
              <View key={item.id || index} style={styles.foodItem}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                  <Text style={styles.foodPrice}>Rs. {parseFloat(item.unit_price || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.foodDetails}>
                  <Text style={styles.foodDetailText}>Stock Code: {item.stk_code}</Text>
                  <Text style={styles.foodDetailText}>Quantity: {item.quantity}</Text>
                  <Text style={styles.foodDetailText}>Delivered: {item.delivered_qty}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Decorations */}
        {foodData.status_decoration === 'true' && foodData.data_decoration && foodData.data_decoration.length > 0 && (
          <View style={styles.foodCategory}>
            <Text style={styles.categoryTitle}>Decorations</Text>
            {foodData.data_decoration.map((item, index) => (
              <View key={item.id || index} style={styles.foodItem}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                  <Text style={styles.foodPrice}>Rs. {parseFloat(item.unit_price || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.foodDetails}>
                  <Text style={styles.foodDetailText}>Stock Code: {item.stk_code}</Text>
                  <Text style={styles.foodDetailText}>Quantity: {item.quantity}</Text>
                  <Text style={styles.foodDetailText}>Delivered: {item.delivered_qty}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No items message */}
        {(!foodData.data_food || foodData.data_food.length === 0) &&
         (!foodData.data_beverages || foodData.data_beverages.length === 0) &&
         (!foodData.data_decoration || foodData.data_decoration.length === 0) && (
          <Text style={styles.noDataText}>No food items available</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <AppHeader title="Event Details" />

      <Animated.ScrollView
        style={[
          styles.scrollContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
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
              <Icon name="phone" size={16} color={COLORS.ACCENT} />
              <TouchableOpacity onPress={() => handleCall(event.contact_no)}>
                <Text
                  style={[styles.topInfo, { textDecorationLine: 'underline' }]}
                >
                  {event.contact_no}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Icon name="map-marker" size={16} color={COLORS.ACCENT} />
              <Text style={styles.topInfo} numberOfLines={2}>
                {event.venue}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Event Details */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Event Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="account" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Name</Text>
            </View>
            <Text style={styles.value}>{event.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="phone" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Contact No</Text>
            </View>
            <TouchableOpacity onPress={() => handleCall(event.contact_no)}>
              <Text
                style={[
                  styles.value,
                  { color: COLORS.ACCENT, textDecorationLine: 'underline' },
                ]}
              >
                {event.contact_no}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="barcode" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Function Code</Text>
            </View>
            <Text style={styles.value}>{event.function_code}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="map-marker" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Venue</Text>
            </View>
            <Text style={styles.value}>{event.venue}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="account-group" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>No Of Guest</Text>
            </View>
            <Text style={styles.value}>{event.guest}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="currency-usd" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Total</Text>
            </View>
            <Text style={styles.value}>Rs. {total.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="cash" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Advance</Text>
            </View>
            <Text style={styles.value}>Rs. {advance.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="calculator" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Remaining</Text>
            </View>
            <Text
              style={[
                styles.value,
                { color: remaining > 0 ? COLORS.ERROR : COLORS.SUCCESS },
              ]}
            >
              Rs. {remaining.toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Icon name="clock" size={16} color={COLORS.ACCENT} />
              <Text style={styles.label}>Time</Text>
            </View>
            <Text style={styles.value}>{event.time}</Text>
          </View>
        </View>

        {/* Food Items Section */}
        {renderFoodItems()}

        {/* Action Buttons */}
        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Icon name="check-circle" size={20} color={COLORS.PRIMARY_DARK} />
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tentativeBtn}
              onPress={handleTentative}
            >
              <Icon name="clock-outline" size={20} color={COLORS.ACCENT} />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexGrow: 1,
  },
  topCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: COLORS.BLACK,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  topAvatar: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  topName: {
    color: COLORS.WHITE,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  topInfo: {
    color: COLORS.ACCENT,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  foodSection: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.ACCENT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  value: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.ACCENT,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  tentativeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  tentativeText: {
    color: COLORS.ACCENT,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  // Food Items Styles
  foodCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  foodItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodDescription: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  foodPrice: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  foodDetailText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginRight: 12,
    marginBottom: 4,
  },
  loadingText: {
    color: COLORS.ACCENT,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noDataText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});