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
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'react-native-blob-util';

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

    // Mark today as selected
    marked[today] = { selected: true, selectedColor: '#FFD700' };
    setSelectedDate(today);

    // Mark event dates
    eventsList.forEach(event => {
      const eventDate = event.date;
      const eventDateObj = new Date(eventDate);

      // Only mark future dates (today and beyond)
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

  const onDayPress = day => {
    const date = day.dateString;
    const selectedDateObj = new Date(date);
    const todayDate = new Date();

    // Clear time for comparison
    selectedDateObj.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    setSelectedDate(date);

    // Only show events for today and future dates
    if (selectedDateObj < todayDate) {
      setFilteredEvents([]);
    } else {
      const filtered = events.filter(e => e.date === date);
      setFilteredEvents(filtered);
    }

    // Update calendar selection
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
  };

  const clearDateFilter = () => {
    setFilteredEvents(events);
    setSelectedDate('');

    // Reset calendar selection
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach(k => {
      if (newMarked[k].selected) newMarked[k].selected = false;
    });
    setMarkedDates(newMarked);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Storage Permission Required',
              message:
                'This app needs access to your storage to save quotation files',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.Version >= 29) {
          return true;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message:
                'This app needs access to your storage to save quotation files',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };
  const generatePDFHTML = (event, eventItems) => {
    const totalAmount = parseFloat(event.total || 0);
    const advanceAmount = parseFloat(event.advance || 0);
    const balanceAmount = totalAmount - advanceAmount;

    const formatNumber = num => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
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

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation - ${event.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            padding: 0; 
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #B83232; 
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #B83232; 
            margin-bottom: 5px;
          }
          .title { 
            font-size: 20px; 
            margin: 10px 0; 
            font-weight: bold;
          }
          .section { 
            margin: 15px 0; 
          }
          .section-title { 
            font-weight: bold; 
            margin-bottom: 8px;
            color: #B83232;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }
          .client-info { 
            display: flex; 
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .info-column { 
            flex: 1; 
          }
          .info-row { 
            margin: 4px 0; 
            font-size: 12px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0;
            font-size: 10px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left;
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
          }
          .total-section { 
            margin-top: 20px; 
            text-align: right;
            font-size: 12px;
          }
          .total-row { 
            margin: 6px 0; 
          }
          .amount-in-words {
            margin-top: 12px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            font-style: italic;
            font-size: 11px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 12px;
            font-size: 10px;
            color: #666;
          }
          .director-info {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
          }
          .signature-area {
            margin-top: 40px;
            text-align: right;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .header { margin-top: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">CATERING SERVICES</div>
          <div class="title">QUOTATION</div>
        </div>

        <div class="client-info">
          <div class="info-column">
            <div class="section-title">Client Information</div>
            <div class="info-row"><strong>Party Name:</strong> ${
              event.name
            }</div>
            <div class="info-row"><strong>Contact:</strong> ${
              event.contact_no
            }</div>
            <div class="info-row"><strong>Venue:</strong> ${event.venue}</div>
            <div class="info-row"><strong>Director Name:</strong> ${
              event.originalData?.director_name || 'N/A'
            }</div>
          </div>
          <div class="info-column">
            <div class="info-row"><strong>Guests:</strong> ${event.guest}</div>
            <div class="info-row"><strong>Date:</strong> ${event.date}</div>
            <div class="info-row"><strong>Time:</strong> ${
              event.time || 'N/A'
            }</div>
            <div class="info-row"><strong>Function Code:</strong> ${
              event.function_code
            }</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Services & Items</div>
          <table>
            <thead>
              <tr>
                <th style="width: 8%">S.No</th>
                <th style="width: 52%">Description</th>
                <th style="width: 10%">Quantity</th>
                <th style="width: 15%">Rate</th>
                <th style="width: 15%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${eventItems
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${formatNumber(parseFloat(item.unit_price || 0))}</td>
                  <td>Rs. ${formatNumber(
                    parseFloat(item.quantity || 0) *
                      parseFloat(item.unit_price || 0),
                  )}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-row"><strong>Total Amount: Rs. ${formatNumber(
            totalAmount,
          )}</strong></div>
          <div class="total-row"><strong>Advance Paid: Rs. ${formatNumber(
            advanceAmount,
          )}</strong></div>
          <div class="total-row"><strong>Balance Due: Rs. ${formatNumber(
            balanceAmount,
          )}</strong></div>
        </div>

        <div class="amount-in-words">
          <strong>Amount in Words:</strong> ${numberToWords(totalAmount)}
        </div>

        <div class="signature-area">
          <div><strong>Authorized Signature</strong></div>
          <div style="margin-top: 30px;">_________________________</div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <div class="director-info">
            <div>Prepared By: ${
              event.originalData?.salesman_name || 'Sales Team'
            }</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const saveHTMLAsPDF = async (htmlContent, fileName) => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Toast.show({
            type: 'error',
            text1: 'Permission Required',
            text2: 'Storage permission is needed to download files',
          });
          return;
        }

        try {
          const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
          const filePath = `${downloadDir}/${fileName}.html`;

          // Save as HTML file
          await RNFetchBlob.fs.writeFile(filePath, htmlContent, 'utf8');

          // Show system download notification
          RNFetchBlob.android.addCompleteDownload({
            title: `Quotation - ${fileName}`,
            description: 'Quotation HTML downloaded',
            mime: 'text/html',
            path: filePath,
            showNotification: true,
          });

          Toast.show({
            type: 'success',
            text1: 'File Downloaded',
            text2: 'Quotation saved to Downloads folder',
          });

          Alert.alert(
            'Download Complete',
            `Quotation has been saved as HTML file.\n\nTo convert to PDF:\n1. Open the HTML file\n2. Tap Share/Print\n3. Select "Save as PDF"`,
            [{ text: 'OK' }],
          );
        } catch (downloadError) {
          console.log('Download folder error:', downloadError);

          // Fallback to Documents directory
          const documentDir = RNFetchBlob.fs.dirs.DocumentDir;
          const filePath = `${documentDir}/${fileName}.html`;

          await RNFetchBlob.fs.writeFile(filePath, htmlContent, 'utf8');

          Toast.show({
            type: 'success',
            text1: 'File Saved',
            text2: 'Saved to app storage',
          });

          Alert.alert(
            'File Saved',
            `Quotation saved to app storage.\n\nFile: ${fileName}.html`,
            [{ text: 'OK' }],
          );
        }
      } else {
        Alert.alert(
          'Quotation Ready',
          'The quotation has been generated. On iOS, consider using a PDF library.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to save file',
      });
    }
  };

  const handlePrintPDF = async event => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Generating Quotation',
        text2: 'Please wait...',
      });

      // Fetch event items
      const itemsResponse = await fetch(
        `https://cat.de2solutions.com/mobile_dash/get_event_item_detail.php?order_no=${event.id}`,
      );
      const itemsData = await itemsResponse.json();
      const eventItems = itemsData.status === 'true' ? itemsData.data : [];

      // Generate PDF HTML
      const html = generatePDFHTML(event, eventItems);

      // Save HTML file
      const fileName = `Quotation_${event.name.replace(/\s+/g, '_')}_${
        event.function_code
      }`;
      await saveHTMLAsPDF(html, fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: 'Please try again',
      });
    }
  };

  const handleEditEvent = async event => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Loading Event Data',
        text2: 'Please wait...',
      });

      // Fetch event details from both APIs
      const [headerResponse, itemsResponse] = await Promise.all([
        fetch(
          `https://cat.de2solutions.com/mobile_dash/get_event_quotation_header.php`,
        ),
        fetch(
          `https://cat.de2solutions.com/mobile_dash/get_event_item_detail.php?order_no=${event.id}`,
        ),
      ]);

      const headerData = await headerResponse.json();
      const itemsData = await itemsResponse.json();

      if (headerData.status === 'true' && itemsData.status === 'true') {
        const eventHeader =
          headerData.data.find(h => h.order_no === event.id) ||
          event.originalData;
        const eventItems = itemsData.data || [];

        // Prepare data for quotation form
        const quotationData = {
          // Client Information
          clientInfo: {
            contactNo: eventHeader.contact_no || '',
            name: eventHeader.name || '',
            venue: eventHeader.venue || '',
            dateTime: eventHeader.function_date
              ? `${eventHeader.function_date}T${eventHeader.time || '12:00:00'}`
              : '',
            director: eventHeader.director_name || '',
            noOfGuest: eventHeader.guest || '',
          },
          // Event Details
          serviceType: determineServiceType(eventItems),
          rateMode: determineRateMode(eventItems),
          // Items data
          eventItems: eventItems,
          // Totals
          total: eventHeader.total || '0',
          advance: eventHeader.advance || '0',
          // Additional info
          functionCode: eventHeader.function_code || '',
          directorName: eventHeader.director_name || '',
          orderNo: event.id,
        };

        // Navigate to Quotation screen with pre-filled data
        navigation.navigate('Quotation', {
          editData: quotationData,
          isEditMode: true,
        });

        Toast.show({
          type: 'success',
          text1: 'Data Loaded',
          text2: 'Form ready for editing',
        });
      } else {
        throw new Error('Failed to fetch event details');
      }
    } catch (error) {
      console.error('Edit event error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load event details',
      });
    }
  };

  // Helper function to determine service type from items
  const determineServiceType = items => {
    const hasFood = items.some(
      item =>
        item.description?.toLowerCase().includes('food') ||
        item.description?.toLowerCase().includes('beverage'),
    );
    const hasDecoration = items.some(
      item =>
        item.description?.toLowerCase().includes('decoration') ||
        item.description?.toLowerCase().includes('lighting') ||
        item.description?.toLowerCase().includes('sound'),
    );
    const hasServices = items.some(item =>
      item.description?.toLowerCase().includes('service'),
    );

    if (hasFood && hasServices) return 'F+S';
    if (hasFood && hasDecoration) return 'F+D';
    if (hasDecoration) return 'D';
    return 'F'; // Default to Food
  };

  // Helper function to determine rate mode from items
  const determineRateMode = items => {
    const hasPerHead = items.some(item =>
      item.description?.toLowerCase().includes('per head'),
    );
    return hasPerHead ? 'perhead' : 'perkg';
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
                onPress={() => handlePrintPDF(item)}
              >
                <Icon name="file-download" size={18} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditEvent(item)}
              >
                <Icon name="pencil" size={18} color="#FFD700" />
              </TouchableOpacity>
              <View style={styles.chevWrap}>
                <Icon name="chevron-right" size={18} color="#FFD700" />
              </View>
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
                {selectedDate
                  ? `Events for ${formatDate(selectedDate)}`
                  : 'All Events'}
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
    fontSize: 10,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
