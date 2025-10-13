// Quotation.jsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../utils/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../../components/AppHeader';

const API_URL =
  'http://cat.de2solutions.com/mobile_dash/event_post_service.php';
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

const ExcelCell = ({
  value,
  onChange,
  keyboardType = 'default',
  onFocus,
  onBlur,
  isEditing,
  highlight,
  flex,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.cell,
        highlight && { borderColor: COLORS.ACCENT, borderWidth: 2 },
        { flex },
      ]}
      onPress={onFocus}
    >
      {isEditing ? (
        <TextInput
          autoFocus
          value={value}
          style={styles.cellInput}
          onChangeText={onChange}
          keyboardType={keyboardType}
          onBlur={onBlur}
        />
      ) : (
        <Text style={styles.cellText}>{value}</Text>
      )}
    </TouchableOpacity>
  );
};

// NEW: Column-wise Radio Button Component
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

const PAK_BANKS = [
  'HBL',
  'MCB',
  'UBL',
  'Meezan Bank',
  'Allied Bank',
  'Bank Alfalah',
  'Standard Chartered',
];

const Quotation = ({ navigation }) => {
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
  const [foodOwnerAmount, setFoodOwnerAmount] = useState(''); // owner amount per head/kg
  const [decOwnerAmount, setDecOwnerAmount] = useState('');
  const [beverageType, setBeverageType] = useState('none'); // 'none'|'regular'|'can'
  const [advanceMode, setAdvanceMode] = useState('none'); // 'none'|'cash'|'bank'
  const [cashReceived, setCashReceived] = useState('');
  const [bankSelected, setBankSelected] = useState(PAK_BANKS[0]);
  const [bankAmount, setBankAmount] = useState('');

  // NEW: Special instructions for each table
  const [foodInstructions, setFoodInstructions] = useState('');
  const [decInstructions, setDecInstructions] = useState('');
  const [foodInstructionsExpanded, setFoodInstructionsExpanded] =
    useState(false);
  const [decInstructionsExpanded, setDecInstructionsExpanded] = useState(false);

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

  const updateClientInfo = (key, value) =>
    setClientInfo(prev => ({ ...prev, [key]: value }));

  const updateRow = (rows, setRows, id, key, value) => {
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
  };

  const addRow = (rows, setRows) => {
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
  };

  const sumTable = rows =>
    rows.reduce((acc, r) => acc + (parseFloat(r.total || 0) || 0), 0);

  // owner totals (owner-provided per-head/per-kg * guests)
  const guestsCount = Number(clientInfo.noOfGuest) || 0;
  const foodOwnerTotal = (parseFloat(foodOwnerAmount || 0) || 0) * guestsCount;
  const decOwnerTotal = (parseFloat(decOwnerAmount || 0) || 0) * guestsCount;

  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);

  // beverage calculation
  const beverageRate =
    beverageType === 'regular' ? 250 : beverageType === 'can' ? 300 : 0;
  const beverageTotal = beverageRate * guestsCount;

  // final totals: manual override still respected
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

  // NEW: Get table title based on service type
  const getTableTitle = tableType => {
    if (tableType === 'food') {
      return serviceType.includes('S') && serviceType !== 'F+S'
        ? 'Services Details'
        : 'Food Details';
    } else if (tableType === 'dec') {
      return 'Decoration Details';
    }
    return 'Table Details';
  };

  const preparePayload = () => {
    const totalFood = Math.round(finalFoodTotal);
    const totalDecor = Math.round(finalDecTotal);
    const totalGrand = Math.round(grandTotal);

    const cleanFoodDetails = foodRows
      .filter(r => r.menu || r.qty || r.rate || r.total)
      .map(r => ({
        menu: r.menu,
        qty: r.qty ? String(r.qty) : '0',
        rate: r.rate ? String(r.rate) : '0',
        total: r.total ? String(Math.round(parseFloat(r.total))) : '0',
      }));

    const cleanDecorDetails = decRows
      .filter(r => r.menu || r.qty || r.rate || r.total)
      .map(r => ({
        menu: r.menu,
        qty: r.qty ? String(r.qty) : '0',
        rate: r.rate ? String(r.rate) : '0',
        total: r.total ? String(Math.round(parseFloat(r.total))) : '0',
      }));

    const data = {
      contactNo: clientInfo.contactNo,
      contactName: clientInfo.name,
      venue: clientInfo.venue,
      dateTime: clientInfo.dateTime,
      director: clientInfo.director,
      guests: clientInfo.noOfGuest,
      rateMode: rateMode,
      serviceType: serviceType,
      perHeadInfo: rateMode === 'perhead' ? perHeadInfo : '',
      foodTotal: String(totalFood),
      decorTotal: String(totalDecor),
      beverageType,
      beverageTotal: String(Math.round(beverageTotal)),
      ownerFoodAmountPerGuest: String(foodOwnerAmount || '0'),
      ownerDecAmountPerGuest: String(decOwnerAmount || '0'),
      grandTotal: String(totalGrand),
      advanceMode,
      advancePaid: String(advancePaid),
      bankSelected: advanceMode === 'bank' ? bankSelected : '',
      foodDetails: cleanFoodDetails,
      decorationDetails: cleanDecorDetails,
      // NEW: Include special instructions in payload
      foodInstructions,
      decInstructions,
    };

    return data;
  };

  const handleSave = async () => {
    const payload = preparePayload();

    if (
      !clientInfo.contactNo ||
      !clientInfo.name ||
      !clientInfo.venue ||
      !rateMode ||
      !serviceType
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all essential client details (Name, Contact No, Venue), rate mode (Per Head/Per KG) and service type (F, D, F+D, F+S) before saving.',
      );
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (response.ok) {
        Alert.alert(
          'Success! 🎉',
          'Quotation data has been successfully sent to the server.',
        );
      } else {
        Alert.alert(
          'API Error',
          `Failed to post data. Status: ${response.status}.`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Could not connect to the API server: ' + error.message,
      );
    }
  };

  // NEW: Download PDF function
  const handleDownloadPDF = () => {
    Alert.alert(
      'Download PDF',
      'PDF download functionality will be implemented here. Data is ready for PDF generation.',
      [{ text: 'OK' }],
    );
    // Here you would typically call your PDF generation API
    // For now, we'll just show an alert
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
        ? serviceType.includes('S') && serviceType !== 'F+S'
          ? 'Services Total'
          : 'Food Total'
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

  // NEW: Render special instructions for each table
  const renderTableInstructions = (
    instructions,
    setInstructions,
    expanded,
    setExpanded,
    tableName,
  ) => {
    const placeholder =
      tableName === 'food' && serviceType.includes('S') && serviceType !== 'F+S'
        ? 'Enter specific services instructions here...'
        : tableName === 'food'
        ? 'Enter specific food instructions here...'
        : 'Enter specific decoration instructions here...';

    return (
      <View style={[styles.section, { padding: 12, marginTop: 8 }]}>
        <Text style={styles.totalLabel}>
          {tableName === 'food' &&
          serviceType.includes('S') &&
          serviceType !== 'F+S'
            ? 'Services Instructions'
            : tableName === 'food'
            ? 'Food Instructions'
            : 'Decoration Instructions'}
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setExpanded(v => !v)}
        >
          <TextInput
            style={[
              styles.perHeadInfoInput,
              expanded ? styles.perHeadExpanded : null,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#666"
            multiline
            numberOfLines={expanded ? 4 : 1}
            value={instructions}
            onChangeText={setInstructions}
            onFocus={() => setExpanded(true)}
            onBlur={() => setExpanded(false)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTable = (rows, setRows, title, autoTotal, tableName) => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {getTableTitle(tableName)}{' '}
          {rateMode === 'perhead' ? '(Per Head)' : '(Per KG)'}
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: COL_FLEX.s_no }]}>S#</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.menu }]}>Detail</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.qty }]}>Qty</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.rate }]}>Rate</Text>
        <Text style={[styles.headerCell, { flex: COL_FLEX.total }]}>Total</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        renderItem={({ item, index }) =>
          renderExcelRow(item, index, rows, setRows, tableName)
        }
        scrollEnabled={false}
      />

      {/* Add row + Owner amount input + Totals in a single inline row */}
      <View style={styles.addAndTotalsRow}>
        <TouchableOpacity
          style={styles.smallAddLeft}
          onPress={() => addRow(rows, setRows)}
        >
          <Ionicons name="add" size={18} color={COLORS.WHITE} />
        </TouchableOpacity>

        {/* Owner editable per-guest / per-kg amount input for this table */}
        <View style={styles.ownerAmountWrap}>
          <Text style={styles.ownerLabel}>(per guest):</Text>
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

      {/* NEW: Special Instructions for this table */}
      {tableName === 'food'
        ? renderTableInstructions(
            foodInstructions,
            setFoodInstructions,
            foodInstructionsExpanded,
            setFoodInstructionsExpanded,
            'food',
          )
        : renderTableInstructions(
            decInstructions,
            setDecInstructions,
            decInstructionsExpanded,
            setDecInstructionsExpanded,
            'dec',
          )}
    </View>
  );

  // Date display formatting to 12-hour with AM/PM
  const formatDisplayDate = isoString => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString();
      // build time with 12-hour format and AM/PM
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

  // Handlers for Date & Time pickers: ensures we store ISO string and show current date on open
  const openDatePicker = () => {
    const start = clientInfo.dateTime
      ? new Date(clientInfo.dateTime)
      : new Date();
    setTempDate(start);
    setShowDateModal(true);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Quotation" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* --- Client Information Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>

          {/* ===== Top Info Section (Updated Styling) ===== */}
          <View style={styles.infoCard}>
            {/* Row 1: Contact No & Name */}
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

            {/* Row 2: Venue & DateTime */}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => {
                  openDatePicker();
                }}
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

            {/* Row 3: Director & Venue */}
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

          {/** Date Modal(s) - calendar then time to ensure both in one input **/}
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
                    // Close date and open time selector
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
                  // ensure 12-hour on Android (is24Hour = false)
                  is24Hour={false}
                  display={Platform.OS === 'android' ? 'clock' : 'spinner'}
                  onChange={(e, d) => {
                    if (!d) return;
                    // merge date and time
                    const merged = new Date(
                      tempDate.getFullYear(),
                      tempDate.getMonth(),
                      tempDate.getDate(),
                      d.getHours(),
                      d.getMinutes(),
                    );
                    // Store ISO string for reliability across platforms
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

          {/* New Combined row: 6 radio options in a single row */}
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

        {/* --- Tables Section --- */}
        {rateMode && serviceType ? (
          <>
            {/* FIXED: For F+S, show BOTH Food and Services tables */}
            {serviceType === 'F+S' ? (
              <>
                {/* Food Table for F+S */}
                {renderTable(
                  foodRows,
                  setFoodRows,
                  'Food Details',
                  foodAutoTotal,
                  'food',
                )}

                {/* Services Table for F+S */}
                {renderTable(
                  decRows,
                  setDecRows,
                  'Services Details',
                  decAutoTotal,
                  'dec',
                )}
              </>
            ) : (
              <>
                {/* Original logic for other service types */}
                {(serviceType.includes('F') || serviceType.includes('S')) &&
                  renderTable(
                    foodRows,
                    setFoodRows,
                    getTableTitle('food'),
                    foodAutoTotal,
                    'food',
                  )}

                {serviceType.includes('D') &&
                  renderTable(
                    decRows,
                    setDecRows,
                    getTableTitle('dec'),
                    decAutoTotal,
                    'dec',
                  )}
              </>
            )}

            {/* Beverages section under Food Details */}
            {(serviceType.includes('F') || serviceType.includes('S')) && (
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
                    <Text style={styles.checkboxLabel}>Regular (Rs. 250)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.checkboxOption,
                      beverageType === 'can'
                        ? styles.checkboxOptionActive
                        : null,
                    ]}
                    onPress={() =>
                      setBeverageType(prev => (prev === 'can' ? 'none' : 'can'))
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
            )}

            {/* Per Head Info Area (Special Instructions) */}
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

            {/* GRAND TOTAL - Footer */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>
                Rs. {Math.round(grandTotal)}
              </Text>
            </View>

            {/* Advance Payment Section */}
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
                  {/* NEW: Show selected bank name */}
                  <View style={styles.bankDisplayRow}>
                    <Text style={styles.bankNameText}>
                      Selected Bank: {bankSelected}
                    </Text>
                  </View>

                  <View style={styles.advanceInputRow}>
                    <Text style={styles.totalLabelSmall}>Bank:</Text>
                    <View style={styles.bankPickerWrap}>
                      <Picker
                        selectedValue={bankSelected}
                        onValueChange={setBankSelected}
                        style={{ flex: 1, height: 40 }} // Reduced height
                      >
                        {PAK_BANKS.map(b => (
                          <Picker.Item key={b} label={b} value={b} />
                        ))}
                      </Picker>
                    </View>
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

        {/* Save and Download Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Quotation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={handleDownloadPDF}
          >
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default Quotation;

// --- STYLES ---
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.GRAY_LIGHT },
  container: { padding: 12 },
  topGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topCell: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.WHITE,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    color: COLORS.BLACK,
    minHeight: 44,
  },
  // Radio Group Row Style
  radioGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 4,
  },
  radioColumnOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioGroupRate: { flex: 2 },
  radioGroupService: { flex: 1.5 },
  radioColumnOptionActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY_DARK,
  },
  radioColumnText: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.PRIMARY_DARK,
    fontWeight: '600',
    textAlign: 'center',
  },
  radioColumnTextActive: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.WHITE,
    fontWeight: '700',
    textAlign: 'center',
  },

  perHeadInfoInput: {
    minHeight: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#eee',
    color: COLORS.BLACK,
    marginTop: 8,
  },
  perHeadExpanded: { minHeight: 100 },
  section: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 4,
    overflow: 'hidden',
  },
  headerCell: {
    color: COLORS.WHITE,
    textAlign: 'center',
    paddingVertical: 8,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
    minHeight: 40,
    paddingHorizontal: 2,
  },
  cellText: { textAlign: 'center', color: COLORS.BLACK, fontSize: 12 },
  cellInput: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.BLACK,
    width: '100%',
    paddingVertical: 6,
    fontSize: 12,
  },
  addAndTotalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  smallAddLeft: {
    backgroundColor: COLORS.PRIMARY,
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  ownerAmountWrap: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  ownerLabel: { fontSize: 12, color: COLORS.GRAY_DARK, marginBottom: 4 },
  ownerInput: {
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  totalInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  totalLabelSmall: {
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
    fontSize: 13,
    marginRight: 6,
  },
  totalCellSmall: {
    minWidth: 70,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalValueSmall: { fontWeight: '700', color: COLORS.BLACK, fontSize: 13 },
  totalInputSmall: {
    padding: 0,
    height: 22,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.BLACK,
    fontSize: 13,
  },

  beverageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxOptionActive: {
    backgroundColor: '#f5f5f5',
    borderColor: COLORS.PRIMARY,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontWeight: '600',
    color: COLORS.PRIMARY_DARK,
  },

  beverageTotalRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryBox: { alignItems: 'flex-end', paddingHorizontal: 8 },
  summaryLabel: { color: COLORS.GRAY_DARK, fontSize: 12 },
  summaryValue: { fontWeight: '800', fontSize: 16, color: COLORS.ACCENT },

  grandTotalRow: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#fff', // keep white card style
    borderWidth: 1,
    borderColor: '#eee',
  },
  grandLabel: { color: COLORS.PRIMARY_DARK, fontSize: 18, fontWeight: '700' },
  grandValue: { color: COLORS.PRIMARY_DARK, fontSize: 18, fontWeight: '700' },

  // Advance Payment styles
  advanceRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  advanceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  advanceOptionActive: {
    backgroundColor: '#f0f0f0',
    borderColor: COLORS.PRIMARY,
  },
  advanceText: { color: COLORS.PRIMARY_DARK, fontWeight: '700' },
  advanceTextActive: { color: COLORS.PRIMARY_DARK, fontWeight: '800' },
  advanceInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  advanceInput: {
    minWidth: 120,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    backgroundColor: '#fafafa',
    textAlign: 'right',
  },
  bankPickerWrap: {
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  // NEW: Bank display row
  bankDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1ecff',
  },
  bankNameText: {
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
  },

  // NEW: Button row for side-by-side buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.ACCENT,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: COLORS.PRIMARY_DARK, fontWeight: '800', fontSize: 16 },
  downloadBtn: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: { color: COLORS.WHITE, fontWeight: '800', fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 8,
    color: COLORS.PRIMARY_DARK,
  },
  modalClose: { marginTop: 8, alignItems: 'flex-end' },
  totalLabel: { fontWeight: '700', color: COLORS.PRIMARY_DARK, fontSize: 14 },
  modeNoteText: {
    textAlign: 'center',
    color: COLORS.GRAY_DARK,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    fontSize: 14,
    color: COLORS.DARK,
  },
});
