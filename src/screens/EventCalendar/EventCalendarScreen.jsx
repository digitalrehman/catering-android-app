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
  Alert,
  PermissionsAndroid,
  Platform,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'react-native-blob-util';

// PDF Component for better reusability
const PDFGenerator = {
  generateHTML: (event, eventDetails) => {
    const {
      food = [],
      beverages = [],
      decoration = [],
      services = [],
    } = eventDetails;
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

      if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        words +=
          numberToWords(millions).replace(' Rupees Only', '') + ' Million ';
        num %= 1000000;
      }

      if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        if (thousands > 0) {
          words +=
            numberToWords(thousands).replace(' Rupees Only', '') + ' Thousand ';
        }
        num %= 1000;
      }

      if (num >= 100) {
        const hundreds = Math.floor(num / 100);
        words += ones[hundreds] + ' Hundred ';
        num %= 100;
      }

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

    const renderTableSection = (items, title, startIndex = 0) => {
      if (!items || items.length === 0) return '';

      const rows = items
        .map(
          (item, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
            startIndex + index + 1
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${
            item.description || 'N/A'
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
            item.quantity || '0'
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs. ${formatNumber(
            parseFloat(item.unit_price || 0),
          )}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs. ${formatNumber(
            parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
          )}</td>
        </tr>
      `,
        )
        .join('');

      const total = items.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
        0,
      );

      return `
        <tr>
          <td colspan="5" style="background-color: #B83232; color: white; font-weight: bold; padding: 10px; border: 1px solid #B83232; font-size: 12px;">${title.toUpperCase()}</td>
        </tr>
        ${rows}
        <tr style="background-color: #f9f9f9;">
          <td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${title} Total:</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Rs. ${formatNumber(
            total,
          )}</td>
        </tr>
      `;
    };

    let currentIndex = 0;
    const foodSection = renderTableSection(food, 'FOOD', currentIndex);
    currentIndex += food.length;
    const beveragesSection = renderTableSection(
      beverages,
      'BEVERAGES',
      currentIndex,
    );
    currentIndex += beverages.length;
    const decorationSection = renderTableSection(
      decoration,
      'DECORATION',
      currentIndex,
    );
    currentIndex += decoration.length;
    const servicesSection = renderTableSection(
      services,
      'SERVICES',
      currentIndex,
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation - ${event.name}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 15px; 
            padding: 0; 
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #B83232; 
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .company-name { 
            font-size: 22px; 
            font-weight: bold; 
            color: #B83232; 
            margin-bottom: 4px;
          }
          .title { 
            font-size: 18px; 
            margin: 8px 0; 
            font-weight: bold;
          }
          .content-wrapper {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .client-info { 
            flex: 1;
            margin-right: 12px;
          }
          .event-details {
            flex: 1;
            margin-left: 12px;
          }
          .section-title { 
            font-weight: bold; 
            margin-bottom: 6px;
            color: #B83232;
            font-size: 13px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }
          .info-row { 
            margin: 3px 0; 
            font-size: 11px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
            font-size: 10px;
            border: 1px solid #ddd;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left;
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
            padding: 8px;
          }
          .grand-total-section { 
            margin-top: 15px; 
            text-align: right;
            font-size: 13px;
            border-top: 2px solid #B83232;
            padding-top: 8px;
          }
          .total-row { 
            margin: 5px 0; 
          }
          .amount-in-words {
            margin-top: 10px;
            padding: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            font-style: italic;
            font-size: 10px;
          }
          .footer {
            margin-top: 25px;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            font-size: 9px;
            color: #666;
          }
          .director-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }
          .signature-area {
            margin-top: 30px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">CATERING SERVICES</div>
          <div class="title">QUOTATION</div>
        </div>

        <div class="content-wrapper">
          <div class="client-info">
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
          
          <div class="event-details">
            <div class="section-title">Event Details</div>
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
                <th style="width: 8%; text-align: center;">S.No</th>
                <th style="width: 52%">Description</th>
                <th style="width: 10%; text-align: center;">Quantity</th>
                <th style="width: 15%; text-align: right;">Rate</th>
                <th style="width: 15%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${foodSection}
              ${beveragesSection}
              ${decorationSection}
              ${servicesSection}
            </tbody>
          </table>
        </div>

        <div class="grand-total-section">
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
          <div style="margin-top: 25px;">_________________________</div>
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
  },
};

// Base64 encoding function for React Native
const base64Encode = str => {
  try {
    // Using btoa for base64 encoding (available in React Native)
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Base64 encoding error:', error);
    // Fallback: simple base64 encoding
    const base64Chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = str.charCodeAt(i++);
      const c = str.charCodeAt(i++);

      const bitmap = (a << 16) | (b << 8) | c;

      result +=
        base64Chars.charAt((bitmap >> 18) & 63) +
        base64Chars.charAt((bitmap >> 12) & 63) +
        base64Chars.charAt((bitmap >> 6) & 63) +
        base64Chars.charAt(bitmap & 63);
    }

    // Pad with '=' if necessary
    const padding = str.length % 3;
    if (padding === 1) {
      return result.slice(0, -2) + '==';
    } else if (padding === 2) {
      return result.slice(0, -1) + '=';
    }

    return result;
  }
};

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

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Storage Permission Required',
              message:
                'This app needs access to your storage to save PDF files',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.Version >= 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message:
                'This app needs access to your storage to save PDF files',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message:
                'This app needs access to your storage to save PDF files',
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

  const generateHTMLContent = async (event, eventDetails) => {
    try {
      const htmlContent = PDFGenerator.generateHTML(event, eventDetails);
      return htmlContent;
    } catch (error) {
      console.error('HTML generation error:', error);
      throw error;
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
      const pdfContent = await generatePDFContent(event, eventDetails);

      // PDF file create karenge
      const fileName = `Quotation_${event.name.replace(/\s+/g, '_')}_${
        event.function_code
      }.pdf`;

      let filePath;
      if (Platform.OS === 'android') {
        const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
        filePath = `${downloadDir}/${fileName}`;

        // PDF content ko file mein save karenge
        await RNFetchBlob.fs.writeFile(filePath, pdfContent, 'utf8');
      } else {
        const documentDir = RNFetchBlob.fs.dirs.DocumentDir;
        filePath = `${documentDir}/${fileName}`;
        await RNFetchBlob.fs.writeFile(filePath, pdfContent, 'utf8');
      }

      // Share karenge
      const shareOptions = {
        title: `Quotation - ${event.name}`,
        message: `Quotation for ${event.name}`,
        url: `file://${filePath}`,
        type: 'application/pdf',
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Please try again',
      });
    }
  };

  const handleDownloadPDF = async event => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Generating Quotation',
        text2: 'Please wait...',
      });

      const eventDetails = await fetchEventDetails(event.id);
      const htmlContent = await generateHTMLContent(event, eventDetails);

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      const fileName = `Quotation_${event.name.replace(/\s+/g, '_')}_${
        event.function_code
      }.html`;

      let filePath;

      if (Platform.OS === 'android') {
        const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
        filePath = `${downloadDir}/${fileName}`;

        await RNFetchBlob.fs.writeFile(filePath, htmlContent, 'utf8');

        RNFetchBlob.android.addCompleteDownload({
          title: `Quotation - ${event.name}`,
          description: 'Quotation HTML downloaded',
          mime: 'text/html',
          path: filePath,
          showNotification: true,
        });
      } else {
        const documentDir = RNFetchBlob.fs.dirs.DocumentDir;
        filePath = `${documentDir}/${fileName}`;
        await RNFetchBlob.fs.writeFile(filePath, htmlContent, 'utf8');
      }

      Toast.show({
        type: 'success',
        text1: 'Document Downloaded',
        text2: 'Quotation saved successfully',
      });

      Alert.alert(
        'Download Complete',
        'Quotation has been saved to your device. You can:\n\n• Open it in a browser\n• Print it as PDF\n• Share it from your file manager',
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Please try again',
      });
    }
  };

  const handleShareOptions = event => {
    Alert.alert(
      'Quotation Options',
      'Choose how you want to handle the quotation:',
      [
        {
          text: '📥 Download to Device',
          onPress: () => handleDownloadPDF(event),
          style: 'default',
        },
        {
          text: '📤 Share Directly',
          onPress: () => handleDirectShare(event),
          style: 'default',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleEditEvent = async event => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Loading Event Data',
        text2: 'Please wait...',
      });

      const formData = new FormData();
      formData.append('order_no', event.id);

      const [headerResponse, itemsResponse] = await Promise.all([
        fetch(
          'https://cat.de2solutions.com/mobile_dash/get_event_quotation_header.php',
        ),
        fetch(
          'https://cat.de2solutions.com/mobile_dash/get_event_food_decor_detail.php',
          {
            method: 'POST',
            body: formData,
          },
        ),
      ]);

      const headerData = await headerResponse.json();
      const itemsData = await itemsResponse.json();

      if (headerData.status === 'true') {
        const eventHeader =
          headerData.data.find(h => h.order_no === event.id) ||
          event.originalData;

        const eventDetails = {
          food:
            itemsData.status_food === 'true' ? itemsData.data_food || [] : [],
          beverages:
            itemsData.status_beverages === 'true'
              ? itemsData.data_beverages || []
              : [],
          decoration:
            itemsData.status_decoration === 'true'
              ? itemsData.data_decoration || []
              : [],
          services: [],
        };

        const quotationData = {
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
          serviceType: determineServiceType(eventDetails),
          rateMode: determineRateMode(eventDetails),
          eventItems: [
            ...eventDetails.food,
            ...eventDetails.beverages,
            ...eventDetails.decoration,
            ...eventDetails.services,
          ],
          total: eventHeader.total || '0',
          advance: eventHeader.advance || '0',
          functionCode: eventHeader.function_code || '',
          directorName: eventHeader.director_name || '',
          orderNo: event.id,
        };

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

  const determineServiceType = eventDetails => {
    const { food, decoration, services } = eventDetails;
    const hasFood = food.length > 0;
    const hasDecoration = decoration.length > 0;
    const hasServices = services.length > 0;

    if (hasFood && hasServices) return 'F+S';
    if (hasFood && hasDecoration) return 'F+D';
    if (hasDecoration) return 'D';
    return 'F';
  };

  const determineRateMode = eventDetails => {
    const allItems = [
      ...eventDetails.food,
      ...eventDetails.beverages,
      ...eventDetails.decoration,
      ...eventDetails.services,
    ];
    const hasPerHead = allItems.some(item =>
      item.description?.toLowerCase().includes('per head'),
    );
    return hasPerHead ? 'perhead' : 'perkg';
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
                onPress={() => handleShareOptions(item)}
              >
                <Icon name="share-variant" size={18} color="#FFD700" />
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
});
