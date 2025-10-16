import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../utils/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../../components/AppHeader';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import styles from './quotationStyle';

const DEFAULT_ROWS = 5;

const makeDefaultRows = (startId = 1) =>
  Array.from({ length: DEFAULT_ROWS }).map((_, i) => ({
    id: String(startId + i),
    menu: '',
    qty: '',
    rate: '',
    total: '',
    manualTotal: false,
  }));

const ExcelCell = React.memo(
  ({
    value,
    onChange,
    keyboardType = 'default',
    onFocus,
    onBlur,
    isEditing,
    highlight,
    flex,
  }) => {
    const textInputRef = useRef(null);

    useEffect(() => {
      if (isEditing && textInputRef.current) {
        textInputRef.current.focus();
      }
    }, [isEditing]);

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          styles.cell,
          highlight && { borderColor: COLORS.ACCENT, borderWidth: 2 },
          { flex },
        ]}
        onPress={onFocus} // This will now directly open keyboard
      >
        {isEditing ? (
          <TextInput
            ref={textInputRef}
            value={value}
            style={styles.cellInput}
            onChangeText={onChange}
            keyboardType={keyboardType}
            onBlur={onBlur}
            autoFocus={true} // Auto focus when editing starts
          />
        ) : (
          <Text style={styles.cellText}>{value}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

const RadioButtonColumn = ({ label, selected, onPress, isRateMode }) => {
  const displayLabel =
    label === 'perhead' ? 'Per Head' : label === 'perkg' ? 'Per KG' : label;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.radioColumnOption,
        selected ? styles.radioColumnOptionActive : null,
        isRateMode ? styles.radioGroupRate : styles.radioGroupService,
      ]}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={18}
        color={selected ? COLORS.ACCENT : COLORS.PRIMARY_DARK}
      />
      <Text
        style={selected ? styles.radioColumnTextActive : styles.radioColumnText}
      >
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
};

const Quotation = React.memo(({ navigation }) => {
  const user = useSelector(state => state.Data.currentData);

  // Animation value for screen opening
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [clientInfo, setClientInfo] = useState({
    contactNo: '',
    name: '',
    venue: '',
    dateTime: '',
    director: '',
    noOfGuest: '',
  });

  const [manualFoodTotal, setManualFoodTotal] = useState('');
  const [manualDecTotal, setManualDecTotal] = useState('');

  const [serviceType, setServiceType] = useState('F');
  const [rateMode, setRateMode] = useState('perhead');

  const [directors, setDirectors] = useState([]);

  // Date/Time Picker States
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const [perHeadInfo, setPerHeadInfo] = useState('');
  const [perHeadExpanded, setPerHeadExpanded] = useState(false);

  const [foodRows, setFoodRows] = useState(makeDefaultRows(1));
  const [decRows, setDecRows] = useState(makeDefaultRows(6));

  const [editingCell, setEditingCell] = useState(null);

  // New states:
  const [foodOwnerAmount, setFoodOwnerAmount] = useState('');
  const [decOwnerAmount, setDecOwnerAmount] = useState('');
  const [beverageType, setBeverageType] = useState('none');
  const [advanceMode, setAdvanceMode] = useState('none');
  const [cashReceived, setCashReceived] = useState('');
  const [banks, setBanks] = useState([]);
  const [bankSelected, setBankSelected] = useState('');
  const [bankAmount, setBankAmount] = useState('');

  // Screen opening animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetch('https://cat.de2solutions.com/mobile_dash/event_bank.php')
      .then(async res => {
        const text = await res
          .json()
          .then(data => JSON.stringify(data))
          .catch(() => '');
        try {
          const json = JSON.parse(text);
          if (json.status === 'true') {
            setBanks(json.data);
          } else {
            console.log('Invalid response:', json);
          }
        } catch (err) {
          console.log('JSON parse error:', err, text);
        }
      })
      .catch(err => console.log('Bank fetch error:', err));
  }, []);

  useEffect(() => {
    fetch('https://cat.de2solutions.com/mobile_dash/director.php')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'true' && Array.isArray(json.data)) {
          setDirectors(json.data);
        }
      })
      .catch(err => console.log('Director fetch error:', err));
  }, []);

  const updateClientInfo = useCallback((key, value) => {
    setClientInfo(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateRow = useCallback((rows, setRows, id, key, value) => {
    const currentRow = rows.find(r => r.id === id);
    if (currentRow && currentRow[key] === value) {
      return;
    }

    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const next = { ...r, [key]: value };
        if (!next.manualTotal && (key === 'qty' || key === 'rate')) {
          const q = parseFloat(next.qty || 0);
          const rt = parseFloat(next.rate || 0);
          next.total =
            !isNaN(q) && !isNaN(rt) ? (q * rt).toFixed(2).toString() : '';
        }
        return next;
      }),
    );
  }, []);

  const addRow = useCallback((rows, setRows) => {
    const nextId =
      (rows.length ? parseInt(rows[rows.length - 1].id, 10) : 0) + 1;
    setRows(prev => [
      ...prev,
      {
        id: String(nextId),
        menu: '',
        qty: '',
        rate: '',
        total: '',
        manualTotal: false,
      },
    ]);
  }, []);

  const sumTable = rows =>
    rows.reduce((acc, r) => acc + (parseFloat(r.total || 0) || 0), 0);

  // Calculations
  const guestsCount = Number(clientInfo.noOfGuest) || 0;
  const foodOwnerTotal = (parseFloat(foodOwnerAmount || 0) || 0) * guestsCount;
  const decOwnerTotal = (parseFloat(decOwnerAmount || 0) || 0) * guestsCount;

  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);

  // Beverage calculation
  const beverageRate =
    beverageType === 'regular' ? 250 : beverageType === 'can' ? 300 : 0;
  const beverageTotal = beverageRate * guestsCount;

  // Final totals
  const finalFoodTotal = manualFoodTotal
    ? parseFloat(manualFoodTotal)
    : foodAutoTotal + foodOwnerTotal;

  const finalDecTotal = manualDecTotal
    ? parseFloat(manualDecTotal)
    : decAutoTotal + decOwnerTotal;

  const grandTotal = finalFoodTotal + finalDecTotal + beverageTotal;

  // Advance / balance
  const advancePaid =
    advanceMode === 'cash'
      ? parseFloat(cashReceived || 0) || 0
      : advanceMode === 'bank'
      ? parseFloat(bankAmount || 0) || 0
      : 0;
  const remainingBalance = Math.max(0, grandTotal - advancePaid);

  // Reset form function
  const resetForm = () => {
    setClientInfo({
      contactNo: '',
      name: '',
      venue: '',
      dateTime: '',
      director: '',
      noOfGuest: '',
    });
    setManualFoodTotal('');
    setManualDecTotal('');
    setServiceType('F');
    setRateMode('perhead');
    setPerHeadInfo('');
    setPerHeadExpanded(false);
    setFoodRows(makeDefaultRows(1));
    setDecRows(makeDefaultRows(6));
    setEditingCell(null);
    setFoodOwnerAmount('');
    setDecOwnerAmount('');
    setBeverageType('none');
    setAdvanceMode('none');
    setCashReceived('');
    setBankSelected('');
    setBankAmount('');
  };

  const handleSave = async () => {
    // Validation
    if (
      !clientInfo.contactNo ||
      !clientInfo.name ||
      !clientInfo.venue ||
      !rateMode ||
      !serviceType
    ) {
      Toast.show({
        type: 'info',
        text1: 'Missing Information',
        text2: 'Please fill all client details before saving.',
      });

      return;
    }

    try {
      const formData = new FormData();

      // Basic client info
      formData.append('party_name', clientInfo.name);

      // Date and time separation
      if (clientInfo.dateTime) {
        const dateObj = new Date(clientInfo.dateTime);
        const datePart = dateObj.toISOString().split('T')[0];
        const timePart = dateObj.toLocaleTimeString('en-GB', { hour12: false });
        formData.append('function_date', datePart);
        formData.append('f_time', timePart);
      }

      formData.append('contact_no', clientInfo.contactNo);
      formData.append('venue', clientInfo.venue);
      formData.append('guest', clientInfo.noOfGuest || '0');
      formData.append('director_id', Number(clientInfo.director) || 0);

      // Totals
      formData.append('total', String(Math.round(grandTotal)));
      formData.append('so_advance', String(Math.round(advancePaid)));

      // User ID
      formData.append('user_id', Number(user?.id) || 12);

      // Event type mapping
      const eventTypeMap = {
        D: '1',
        F: '2',
        'F+D': '3',
        'F+S': '4',
      };
      formData.append('event_type', eventTypeMap[serviceType] || '2');

      // Sales type mapping
      const salesTypeMap = {
        perkg: '1',
        perhead: '4',
      };
      formData.append('sales_type', salesTypeMap[rateMode] || '4');

      formData.append('bank_id', Number(bankSelected) || 0);

      // Prepare sales_order_details array
      const salesOrderDetails = [];

      // Add food items
      foodRows
        .filter(row => row.menu)
        .forEach(row => {
          salesOrderDetails.push({
            description: row.menu,
            quantity: row.qty && row.qty.trim() !== '' ? row.qty : '0',
            unit_price: row.rate && row.rate.trim() !== '' ? row.rate : '0',
          });
        });

      // Add decoration items
      decRows
        .filter(row => row.menu)
        .forEach(row => {
          salesOrderDetails.push({
            description: row.menu,
            quantity: row.qty && row.qty.trim() !== '' ? row.qty : '0',
            unit_price: row.rate && row.rate.trim() !== '' ? row.rate : '0',
          });
        });

      // Add per-head items
      if (rateMode === 'perhead') {
        if (foodOwnerAmount && parseFloat(foodOwnerAmount) > 0) {
          salesOrderDetails.push({
            description: 'Food Per Head',
            quantity: clientInfo.noOfGuest || '0',
            unit_price: foodOwnerAmount,
          });
        }

        if (decOwnerAmount && parseFloat(decOwnerAmount) > 0) {
          salesOrderDetails.push({
            description:
              serviceType === 'F+S'
                ? 'Services Per Head'
                : 'Decoration Per Head',
            quantity: clientInfo.noOfGuest || '0',
            unit_price: decOwnerAmount,
          });
        }

        if (beverageType !== 'none') {
          const beverageDesc =
            beverageType === 'regular'
              ? 'Beverages Per Head Regular'
              : 'Beverages Per Head Can';

          salesOrderDetails.push({
            description: beverageDesc,
            quantity: clientInfo.noOfGuest || '0',
            unit_price: beverageType === 'regular' ? '250' : '300',
          });
        }
      }

      // Convert to JSON string
      if (salesOrderDetails.length > 0) {
        formData.append(
          'sales_order_details',
          JSON.stringify(salesOrderDetails),
        );
      }

      // API Call
      const response = await fetch(
        'https://cat.de2solutions.com/mobile_dash/post_event_quotation.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText, status: 'parse_error' };
      }

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success 🎉',
          text2: 'Quotation has been successfully saved.',
        });

        // Reset form and navigate to EventCalendar
        resetForm();
        navigation.navigate('EventCalendar');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to save. Please try again.',
        });
      }
    } catch (error) {
      console.error('Save error details:', error);
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Cannot connect to server. Please check your internet connection and try again.',
        );
      } else {
        Alert.alert('Error', `Failed to save: ${error.message}`);
      }
    }
  };

  const COL_FLEX = {
    s_no: 0.1,
    menu: 0.45,
    qty: 0.1,
    rate: 0.15,
    total: 0.2,
  };

  const renderExcelRow = (item, index, rows, setRows, tableName) => {
    const cellKey = key => `${tableName}-${item.id}-${key}`;
    const displayTotal = item.total
      ? String(Math.round(parseFloat(item.total)))
      : '';

    return (
      <View style={styles.row} key={item.id}>
        <View style={[styles.cell, { flex: COL_FLEX.s_no }]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>

        <ExcelCell
          value={item.menu}
          flex={COL_FLEX.menu}
          onChange={t => updateRow(rows, setRows, item.id, 'menu', t)}
          onFocus={() => setEditingCell(cellKey('menu'))}
          onBlur={() => setEditingCell(null)}
          isEditing={editingCell === cellKey('menu')}
          highlight={editingCell === cellKey('menu')}
        />

        <ExcelCell
          value={String(item.qty)}
          flex={COL_FLEX.qty}
          keyboardType="numeric"
          onChange={t => updateRow(rows, setRows, item.id, 'qty', t)}
          onFocus={() => setEditingCell(cellKey('qty'))}
          onBlur={() => setEditingCell(null)}
          isEditing={editingCell === cellKey('qty')}
          highlight={editingCell === cellKey('qty')}
        />

        <ExcelCell
          value={String(item.rate)}
          flex={COL_FLEX.rate}
          keyboardType="numeric"
          onChange={t => updateRow(rows, setRows, item.id, 'rate', t)}
          onFocus={() => setEditingCell(cellKey('rate'))}
          onBlur={() => setEditingCell(null)}
          isEditing={editingCell === cellKey('rate')}
          highlight={editingCell === cellKey('rate')}
        />

        <ExcelCell
          value={displayTotal}
          flex={COL_FLEX.total}
          keyboardType="numeric"
          onChange={t =>
            setRows(prev =>
              prev.map(r =>
                r.id === item.id ? { ...r, total: t, manualTotal: true } : r,
              ),
            )
          }
          onFocus={() => setEditingCell(cellKey('total'))}
          onBlur={() => setEditingCell(null)}
          isEditing={editingCell === cellKey('total')}
          highlight={editingCell === cellKey('total')}
        />
      </View>
    );
  };

  const renderEditableTableTotal = (
    tableName,
    autoTotal,
    manualTotal,
    setManualTotal,
  ) => {
    const label =
      tableName === 'food'
        ? 'Food Total'
        : serviceType === 'F+S'
        ? 'Services Total'
        : 'Decor Total';
    const cellKey = `${tableName}-table-total`;
    const displayValue = manualTotal || String(Math.round(autoTotal));

    return (
      <View style={styles.totalInlineRow}>
        <Text style={styles.totalLabelSmall}>{label}:</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.totalCellSmall,
            editingCell === cellKey && {
              borderColor: COLORS.ACCENT,
              borderWidth: 2,
            },
          ]}
          onPress={() => setEditingCell(cellKey)}
        >
          {editingCell === cellKey ? (
            <TextInput
              autoFocus
              value={manualTotal}
              onChangeText={setManualTotal}
              keyboardType="numeric"
              onBlur={() => setEditingCell(null)}
              style={styles.totalInputSmall}
            />
          ) : (
            <Text style={styles.totalValueSmall}>{displayValue}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTable = (rows, setRows, title, autoTotal, tableName) => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {title} {rateMode === 'perhead' ? '(Per Head)' : '(Per KG)'}
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: COL_FLEX.s_no }]}>S#</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.menu }]}>Detail</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.qty }]}>Qty</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.rate }]}>Rate</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.total }]}>Total</Text>
      </View>

      <View>
        {rows.map((item, index) =>
          renderExcelRow(item, index, rows, setRows, tableName),
        )}
      </View>

      <View style={styles.addAndTotalsRow}>
        <TouchableOpacity
          style={styles.smallAddLeft}
          onPress={() => addRow(rows, setRows)}
        >
          <Ionicons name="add" size={18} color={COLORS.WHITE} />
        </TouchableOpacity>

        <View style={styles.ownerAmountWrap}>
          <TextInput
            value={tableName === 'food' ? foodOwnerAmount : decOwnerAmount}
            onChangeText={t =>
              tableName === 'food'
                ? setFoodOwnerAmount(t)
                : setDecOwnerAmount(t)
            }
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#666"
            style={styles.ownerInput}
          />
        </View>

        {tableName === 'food'
          ? renderEditableTableTotal(
              'food',
              autoTotal + Math.round(foodOwnerTotal),
              manualFoodTotal,
              setManualFoodTotal,
            )
          : renderEditableTableTotal(
              'dec',
              autoTotal + Math.round(decOwnerTotal),
              manualDecTotal,
              setManualDecTotal,
            )}
      </View>
    </View>
  );

  const formatDisplayDate = isoString => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString();
      const timePart = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} ${timePart}`;
    } catch (e) {
      return isoString;
    }
  };

  const openDatePicker = () => {
    const start = clientInfo.dateTime
      ? new Date(clientInfo.dateTime)
      : new Date();
    setTempDate(start);
    setShowDateModal(true);
  };

  return (
    <Animated.View
      style={[
        styles.screen,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <AppHeader title="Quotation" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Client Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Contact No."
                placeholderTextColor="#b0b0b0"
                value={clientInfo.contactNo}
                keyboardType="phone-pad"
                onChangeText={t => updateClientInfo('contactNo', t)}
              />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#b0b0b0"
                value={clientInfo.name}
                onChangeText={t => updateClientInfo('name', t)}
              />
            </View>

            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={openDatePicker}
              >
                <Text
                  style={{
                    color: clientInfo.dateTime ? COLORS.DARK : '#b0b0b0',
                    fontSize: 14,
                  }}
                >
                  {clientInfo.dateTime
                    ? formatDisplayDate(clientInfo.dateTime)
                    : 'Date & Time'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="No of Guest"
                placeholderTextColor="#b0b0b0"
                value={clientInfo.noOfGuest}
                keyboardType="numeric"
                onChangeText={t => updateClientInfo('noOfGuest', t)}
              />
            </View>

            <View style={styles.inputRow}>
              <View
                style={[styles.input, { padding: 0, justifyContent: 'center' }]}
              >
                <Picker
                  selectedValue={clientInfo.director}
                  onValueChange={value => updateClientInfo('director', value)}
                  dropdownIconColor={COLORS.PRIMARY_DARK}
                  style={{
                    color: clientInfo.director ? COLORS.DARK : '#b0b0b0',
                    fontSize: 14,
                  }}
                >
                  <Picker.Item
                    label="Select Director"
                    value=""
                    color="#b0b0b0"
                  />
                  {directors.map(d => (
                    <Picker.Item
                      key={d.combo_code}
                      label={d.description}
                      value={d.combo_code}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Venue"
                placeholderTextColor="#b0b0b0"
                value={clientInfo.venue}
                onChangeText={t => updateClientInfo('venue', t)}
              />
            </View>
          </View>

          <Modal visible={showDateModal} transparent animationType="slide">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  onChange={(e, d) => {
                    if (!d) return;
                    setTempDate(d);
                    if (Platform.OS === 'android') {
                      setShowDateModal(false);
                      setTimeout(() => setShowTimeModal(true), 250);
                    } else {
                      setShowDateModal(false);
                      setShowTimeModal(true);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={{ color: COLORS.PRIMARY }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={showTimeModal} transparent animationType="slide">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'android' ? 'clock' : 'spinner'}
                  onChange={(e, d) => {
                    if (!d) return;
                    const merged = new Date(
                      tempDate.getFullYear(),
                      tempDate.getMonth(),
                      tempDate.getDate(),
                      d.getHours(),
                      d.getMinutes(),
                    );
                    updateClientInfo('dateTime', merged.toISOString());
                    setShowTimeModal(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowTimeModal(false)}
                >
                  <Text style={{ color: COLORS.PRIMARY }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={[styles.topGrid, styles.radioGroupRow]}>
            {['perhead', 'perkg', 'F', 'D', 'F+D', 'F+S'].map(opt => {
              const isRate = opt === 'perhead' || opt === 'perkg';
              const selected = isRate ? rateMode === opt : serviceType === opt;

              return (
                <RadioButtonColumn
                  key={opt}
                  label={opt}
                  selected={selected}
                  isRateMode={isRate}
                  onPress={() => {
                    if (isRate) setRateMode(opt);
                    else setServiceType(opt);
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Tables Section */}
        {rateMode && serviceType ? (
          <>
            {serviceType === 'F' && (
              <>
                {renderTable(
                  foodRows,
                  setFoodRows,
                  'Food Details',
                  foodAutoTotal,
                  'food',
                )}

                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Beverages</Text>
                  </View>

                  <View style={styles.beverageRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'regular'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'regular' ? 'none' : 'regular',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'regular'
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'regular'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>
                        Regular (Rs. 250)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'can'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'can' ? 'none' : 'can',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'can' ? 'checkbox' : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'can'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>Can (Rs. 300)</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.beverageTotalRow}>
                    <Text style={styles.totalLabelSmall}>Beverage Total:</Text>
                    <Text style={styles.totalValueSmall}>
                      Rs. {Math.round(beverageTotal)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {serviceType === 'D' && (
              <>
                {renderTable(
                  decRows,
                  setDecRows,
                  'Decoration Details',
                  decAutoTotal,
                  'dec',
                )}
              </>
            )}

            {serviceType === 'F+D' && (
              <>
                {renderTable(
                  foodRows,
                  setFoodRows,
                  'Food Details',
                  foodAutoTotal,
                  'food',
                )}

                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Beverages</Text>
                  </View>

                  <View style={styles.beverageRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'regular'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'regular' ? 'none' : 'regular',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'regular'
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'regular'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>
                        Regular (Rs. 250)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'can'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'can' ? 'none' : 'can',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'can' ? 'checkbox' : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'can'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>Can (Rs. 300)</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.beverageTotalRow}>
                    <Text style={styles.totalLabelSmall}>Beverage Total:</Text>
                    <Text style={styles.totalValueSmall}>
                      Rs. {Math.round(beverageTotal)}
                    </Text>
                  </View>
                </View>

                {renderTable(
                  decRows,
                  setDecRows,
                  'Decoration Details',
                  decAutoTotal,
                  'dec',
                )}
              </>
            )}

            {serviceType === 'F+S' && (
              <>
                {renderTable(
                  foodRows,
                  setFoodRows,
                  'Food Details',
                  foodAutoTotal,
                  'food',
                )}

                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Beverages</Text>
                  </View>

                  <View style={styles.beverageRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'regular'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'regular' ? 'none' : 'regular',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'regular'
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'regular'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>
                        Regular (Rs. 250)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'can'
                          ? styles.checkboxOptionActive
                          : null,
                      ]}
                      onPress={() =>
                        setBeverageType(prev =>
                          prev === 'can' ? 'none' : 'can',
                        )
                      }
                    >
                      <Ionicons
                        name={
                          beverageType === 'can' ? 'checkbox' : 'square-outline'
                        }
                        size={18}
                        color={
                          beverageType === 'can'
                            ? COLORS.PRIMARY_DARK
                            : COLORS.PRIMARY_DARK
                        }
                      />
                      <Text style={styles.checkboxLabel}>Can (Rs. 300)</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.beverageTotalRow}>
                    <Text style={styles.totalLabelSmall}>Beverage Total:</Text>
                    <Text style={styles.totalValueSmall}>
                      Rs. {Math.round(beverageTotal)}
                    </Text>
                  </View>
                </View>

                {renderTable(
                  decRows,
                  setDecRows,
                  'Services Details',
                  decAutoTotal,
                  'dec',
                )}
              </>
            )}

            {rateMode === 'perhead' && (
              <View style={[styles.section, { padding: 12 }]}>
                <Text style={styles.totalLabel}>Special Instructions</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setPerHeadExpanded(v => !v)}
                >
                  <TextInput
                    style={[
                      styles.perHeadInfoInput,
                      perHeadExpanded ? styles.perHeadExpanded : null,
                    ]}
                    placeholder="Enter specific per-head menu or notes here..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={perHeadExpanded ? 4 : 1}
                    value={perHeadInfo}
                    onChangeText={setPerHeadInfo}
                    onFocus={() => setPerHeadExpanded(true)}
                    onBlur={() => setPerHeadExpanded(false)}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>
                Rs. {Math.round(grandTotal)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advance Payment</Text>

              <View style={styles.advanceRow}>
                <TouchableOpacity
                  style={[
                    styles.advanceOption,
                    advanceMode === 'cash' ? styles.advanceOptionActive : null,
                  ]}
                  onPress={() => setAdvanceMode('cash')}
                >
                  <Text
                    style={
                      advanceMode === 'cash'
                        ? styles.advanceTextActive
                        : styles.advanceText
                    }
                  >
                    Cash
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.advanceOption,
                    advanceMode === 'bank' ? styles.advanceOptionActive : null,
                  ]}
                  onPress={() => setAdvanceMode('bank')}
                >
                  <Text
                    style={
                      advanceMode === 'bank'
                        ? styles.advanceTextActive
                        : styles.advanceText
                    }
                  >
                    Bank
                  </Text>
                </TouchableOpacity>
              </View>

              {advanceMode === 'cash' && (
                <View style={styles.advanceInputRow}>
                  <Text style={styles.totalLabelSmall}>Cash Received:</Text>
                  <TextInput
                    value={cashReceived}
                    onChangeText={setCashReceived}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666"
                    style={styles.advanceInput}
                  />
                </View>
              )}

              {advanceMode === 'bank' && (
                <>
                  <View style={styles.bankDisplayRow}>
                    <Text style={styles.bankNameText}>
                      Selected Bank: {bankSelected}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.input,
                      { padding: 0, justifyContent: 'center' },
                    ]}
                  >
                    <Picker
                      selectedValue={bankSelected}
                      onValueChange={value => setBankSelected(value)}
                      dropdownIconColor={COLORS.PRIMARY_DARK}
                      style={{
                        color: bankSelected ? COLORS.DARK : '#b0b0b0',
                        fontSize: 14,
                      }}
                    >
                      <Picker.Item
                        label="Select Bank"
                        value=""
                        color="#b0b0b0"
                      />
                      {banks.map(b => (
                        <Picker.Item
                          key={b.id}
                          label={b.bank_account_name}
                          value={b.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.advanceInputRow}>
                    <Text style={styles.totalLabelSmall}>Amount:</Text>
                    <TextInput
                      value={bankAmount}
                      onChangeText={setBankAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                      style={styles.advanceInput}
                    />
                  </View>
                </>
              )}

              <View style={[styles.advanceInputRow, { marginTop: 10 }]}>
                <Text style={styles.totalLabelSmall}>Remaining Balance:</Text>
                <Text style={styles.totalValueSmall}>
                  Rs. {Math.round(remainingBalance)}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.modeNoteText}>
              Please select Per Head or Per KG and Service Type to view/fill
              quotation details.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Quotation</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Animated.View>
  );
});

export default Quotation;
