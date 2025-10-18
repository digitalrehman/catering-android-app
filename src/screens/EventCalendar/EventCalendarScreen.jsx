import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';
import { encode as btoa } from 'base-64';
import RNFetchBlob from 'react-native-blob-util';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Share from 'react-native-share';

const EventCalendarScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchEvents();

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
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://cat.de2solutions.com/mobile_dash/get_event_quotation_header.php',
      );
      const data = await response.json();

      if (data.status === 'true' && Array.isArray(data.data)) {
        const formattedEvents = data.data.map((event, index) => ({
          id: event.order_no || String(index + 1),
          name: event.name || 'N/A',
          contact_no: event.contact_no || 'N/A',
          guest: event.guest || 'N/A',
          venue: event.venue || 'N/A',
          function_code: event.function_code || 'N/A',
          total: event.total || '0',
          advance: event.advance || '0',
          time: event.time || 'N/A',
          date: event.function_date || today,
          image: require('../../assets/images/profile.png'),
          originalData: event,
        }));

        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);
        markDatesWithEvents(formattedEvents);
      } else {
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const markDatesWithEvents = eventsList => {
    const marked = {};
    const todayDate = new Date();

    marked[today] = { selected: true, selectedColor: '#FFD700' };
    setSelectedDate(today);

    eventsList.forEach(event => {
      const eventDate = event.date;
      const eventDateObj = new Date(eventDate);

      if (eventDateObj >= todayDate) {
        if (marked[eventDate]) {
          marked[eventDate] = {
            ...marked[eventDate],
            marked: true,
            dotColor: '#FFD700',
          };
        } else {
          marked[eventDate] = {
            marked: true,
            dotColor: '#FFD700',
          };
        }
      }
    });

    setMarkedDates(marked);
  };

  const onDayPress = useCallback(
    day => {
      const date = day.dateString;
      const selectedDateObj = new Date(date);
      const todayDate = new Date();

      selectedDateObj.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);

      setSelectedDate(date);

      if (selectedDateObj < todayDate) {
        setFilteredEvents([]);
      } else {
        const filtered = events.filter(e => e.date === date);
        setFilteredEvents(filtered);
      }

      const newMarked = { ...markedDates };
      Object.keys(newMarked).forEach(k => {
        if (newMarked[k].selected) newMarked[k].selected = false;
      });
      newMarked[date] = {
        ...(newMarked[date] || {}),
        selected: true,
        selectedColor: '#FFD700',
      };
      setMarkedDates(newMarked);
    },
    [events, markedDates],
  );

  const clearDateFilter = useCallback(() => {
    setFilteredEvents(events);
    setSelectedDate('');

    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach(k => {
      if (newMarked[k].selected) newMarked[k].selected = false;
    });
    setMarkedDates(newMarked);
  }, [events, markedDates]);

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

  const handleDirectShare = async event => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Preparing PDF',
        text2: 'Please wait...',
      });

      const eventDetails = await fetchEventDetails(event.id);
      const pdfPath = await generatePDFFile(event, eventDetails);

      const exists = await RNFetchBlob.fs.exists(pdfPath);
      if (!exists) throw new Error('PDF file not found');

      let fileUrl = `file://${pdfPath.replace('file://', '')}`;

      const shareOptions = {
        title: `Quotation for ${event.name}`,
        url: fileUrl,
        type: 'application/pdf',
        message: `Quotation for ${event.name}`,
        failOnCancel: false,
      };

      await Share.open(shareOptions);
      Toast.show({ type: 'success', text1: 'Quotation shared successfully!' });
    } catch (error) {
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to share PDF',
        text2: error.message || 'Please try again',
      });
    }
  };
  const generatePDFFile = async (event, eventDetails) => {
  const {
    food = [],
    beverages = [],
    decoration = [],
    services = [],
  } = eventDetails;

  const totalAmount = parseFloat(event.total || 0);
  const advanceAmount = parseFloat(event.advance || 0);
  const balanceAmount = totalAmount - advanceAmount;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = height - 50;

  const drawText = (text, x, y, size = 11, bold = false, color = rgb(0, 0, 0)) => {
    page.drawText(String(text || ''), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  const addSpace = (space = 14) => {
    y -= space;
  };

  // Header
  drawText('CATERING SERVICES', 50, y, 20, true, rgb(0.72, 0.2, 0.2));
  addSpace(25);
  drawText('QUOTATION', 50, y, 16, true);
  addSpace(20);
  page.drawLine({
    start: { x: 50, y: y },
    end: { x: width - 50, y: y },
    thickness: 1.5,
    color: rgb(0.72, 0.2, 0.2),
  });
  addSpace(25);

  // Client Info + Event Details
  const clientTopY = y;
  drawText('CLIENT INFORMATION', 50, clientTopY, 13, true, rgb(0.72, 0.2, 0.2));
  addSpace(18);
  drawText(`Party Name: ${event.name}`, 60, y);
  addSpace();
  drawText(`Contact: ${event.contact_no}`, 60, y);
  addSpace();
  drawText(`Venue: ${event.venue}`, 60, y);
  addSpace();
  drawText(`Director Name: ${event.originalData?.director_name || 'N/A'}`, 60, y);

  // Event Details (shifted slightly up)
  const baseY = clientTopY - 2;
  drawText('EVENT DETAILS', 320, baseY, 13, true, rgb(0.72, 0.2, 0.2));
  drawText(`Guests: ${event.guest}`, 330, baseY - 18);
  drawText(`Date: ${event.date}`, 330, baseY - 33);
  drawText(`Time: ${event.time || 'N/A'}`, 330, baseY - 48);
  drawText(`Function Code: ${event.function_code}`, 330, baseY - 63);

  // Reset Y below both blocks
  y = baseY - 90;

  // Table Header
  drawText('SERVICES & ITEMS', 50, y, 13, true, rgb(0.72, 0.2, 0.2));
  addSpace(20);

  const drawTableHeader = () => {
    const headerY = y;
    page.drawRectangle({
      x: 50,
      y: headerY - 4,
      width: width - 100,
      height: 24,
      color: rgb(0.94, 0.94, 0.94),
    });
    drawText('S.No', 55, headerY, 10, true);
    drawText('Description', 90, headerY, 10, true);
    drawText('Qty', 400, headerY, 10, true);
    drawText('Rate', 450, headerY, 10, true);
    drawText('Amount', 520, headerY, 10, true);
    addSpace(28);
  };
  drawTableHeader();

  const formatNum = n => {
    const num = parseFloat(n || 0);
    if (num === 0 || isNaN(num)) return '';
    return num % 1 === 0 ? String(num) : num.toFixed(2).replace(/\.00$/, '');
  };

  const capitalize = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const addSection = (items, title) => {
    if (!items.length) return 0;
    let sectionTotal = 0;

    drawText(capitalize(title), 50, y, 11, true, rgb(0.72, 0.2, 0.2));
    addSpace(16);

    items.forEach((item, index) => {
      const qty = formatNum(item.quantity);
      const rate = formatNum(item.unit_price);
      const amount = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) || 0;
      sectionTotal += amount;

      if (index % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 5,
          width: width - 100,
          height: 22,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      drawText(`${index + 1}`, 55, y, 9);
      drawText(item.description || 'N/A', 80, y, 9);
      drawText(qty, 400, y, 9);
      drawText(rate ? `Rs. ${rate}` : '', 440, y, 9);
      drawText(amount ? `Rs. ${formatNum(amount)}` : '', 515, y, 9);

      addSpace(20);
    });

    drawText(`${capitalize(title)} Total:`, 400, y, 10, true);
    drawText(`Rs. ${formatNum(sectionTotal)}`, 515, y, 10, true);
    addSpace(22);
    return sectionTotal;
  };

  addSection(food, 'food');
  addSection(beverages, 'beverages');
  addSection(decoration, 'decoration');
  addSection(services, 'services');

  addSpace(12);
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.72, 0.2, 0.2),
  });
  addSpace(22);

  drawText('Grand Total:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(totalAmount)}`, 465, y, 11, true);
  addSpace(18);
  drawText('Received Payment:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(advanceAmount)}`, 465, y, 11, true);
  addSpace(18);
  drawText('Balance:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(balanceAmount)}`, 465, y, 11, true);
  addSpace(28);

  const amountInWords = numberToWords(totalAmount);
  drawText('Amount in Words:', 50, y, 10, true, rgb(0.72, 0.2, 0.2));
  addSpace(12);
  page.drawRectangle({
    x: 50,
    y: y - 5,
    width: width - 100,
    height: 26,
    color: rgb(0.98, 0.98, 0.98),
  });
  drawText(amountInWords, 55, y + 2, 9);
  addSpace(40);

  drawText('Authorized Signature', width - 180, y, 10, true);
  page.drawLine({
    start: { x: width - 180, y: y - 5 },
    end: { x: width - 50, y: y - 5 },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });
  addSpace(30);

  page.drawLine({
    start: { x: 50, y: 70 },
    end: { x: width - 50, y: 70 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  drawText('Thank you for your business!', 50, 55, 10, true, rgb(0.72, 0.2, 0.2));
  drawText(`Prepared By: ${event.originalData?.salesman_name || 'Sales Team'}`, 50, 40, 9);
  drawText(`Date: ${new Date().toLocaleDateString()}`, width - 150, 40, 9);
  drawText('CATERING SERVICES - Professional Event Management', width / 2 - 140, 25, 8, true, rgb(0.5, 0.5, 0.5));

  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
  const fileName = `Quotation_${event.name.replace(/\s+/g, '_')}_${event.function_code}.pdf`;
  const path = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
  await RNFetchBlob.fs.writeFile(path, pdfBase64, 'base64');

  return path;
};

  const numberToWords = num => {
    if (num === 0) return 'Zero Rupees Only';

    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    let words = '';

    // Handle millions
    if (num >= 1000000) {
      const millions = Math.floor(num / 1000000);
      words +=
        numberToWords(millions).replace(' Rupees Only', '') + ' Million ';
      num %= 1000000;
    }

    // Handle thousands
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      if (thousands > 0) {
        words +=
          numberToWords(thousands).replace(' Rupees Only', '') + ' Thousand ';
      }
      num %= 1000;
    }

    // Handle hundreds
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      words += ones[hundreds] + ' Hundred ';
      num %= 100;
    }

    // Handle tens and ones
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      num = 0;
    }

    if (num > 0) {
      words += ones[num] + ' ';
    }

    return words.trim() + ' Rupees Only';
  };

  const renderEventCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      >
        <LinearGradient
          colors={['#B83232', '#990303']}
          style={styles.cardInner}
        >
          <View style={styles.cardRow}>
            <Image source={item.image} style={styles.avatar} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.row}>
                <Icon name="phone" size={12} color="#FFD700" />
                <Text style={styles.infoText}>{item.contact_no}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="account-group" size={12} color="#FFD700" />
                <Text style={styles.infoText}>{item.guest} Guests</Text>
              </View>
              <View style={styles.row}>
                <Icon name="map-marker" size={12} color="#FFD700" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.venue}
                </Text>
              </View>
            </View>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDirectShare(item)}
              >
                <Icon name="share-variant" size={18} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate('Quotation', { eventData: item })
                }
              >
                <Icon name="pencil" size={18} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEmptyMessage = () => {
    const selectedDateObj = new Date(selectedDate);
    const todayDate = new Date();

    selectedDateObj.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    if (selectedDateObj < todayDate) {
      return {
        icon: 'clock-alert',
        title: 'Past Date',
        message: 'Events are only available for today and future dates',
      };
    } else if (selectedDate === today) {
      return {
        icon: 'calendar-today',
        title: 'No Events Today',
        message: 'There are no events scheduled for today',
      };
    } else {
      return {
        icon: 'calendar-search',
        title: 'No Events',
        message: `No events scheduled for ${formatDate(selectedDate)}`,
      };
    }
  };

  return (
    <LinearGradient colors={['#B83232', '#4A0000']} style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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
        <AppHeader
          title="View Calendar"
          rightIcon="filter-remove"
          onRightPress={clearDateFilter}
        />

        <View style={styles.calendarContainer}>
          <Calendar
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: '#fff',
              monthTextColor: '#FFD700',
              todayTextColor: '#FFD700',
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

        {loading ? (
          <View style={styles.centerMessageContainer}>
            <Icon name="calendar-sync" size={60} color="#FFD700" />
            <Text style={styles.centerTitle}>Loading Events</Text>
            <Text style={styles.centerMessage}>
              Please wait while we fetch your events...
            </Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedDate ? `${formatDate(selectedDate)}` : 'All Events'}
              </Text>
              {selectedDate && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={clearDateFilter}
                >
                  <Icon name="filter-remove" size={16} color="#FFD700" />
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredEvents}
              keyExtractor={item => item.id}
              renderItem={renderEventCard}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 40,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.centerMessageContainer}>
            <Icon name={getEmptyMessage().icon} size={60} color="#FFD700" />
            <Text style={styles.centerTitle}>{getEmptyMessage().title}</Text>
            <Text style={styles.centerMessage}>
              {getEmptyMessage().message}
            </Text>
            <View style={styles.tipContainer}>
              <Icon name="lightbulb-on" size={18} color="#FFD700" />
              <Text style={styles.tipText}>
                Tip: Select a different date to find events
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

export default EventCalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: 16,
    borderRadius: 12,
    padding: 8,
  },
  eventsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  clearFilterText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  centerMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
  },
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
    color: '#fff',
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
    color: '#FFD700',
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
    backgroundColor: 'rgba(255,215,0,0.1)',
    marginBottom: 4,
  },
  chevWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  centerMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  tipText: {
    color: '#FFD700',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
    flex: 1,
  },
});
