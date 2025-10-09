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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../utils/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
const API_URL =
  'http://cat.de2solutions.com/mobile_dash/event_post_service.php';
const DEFAULT_ROWS = 5;

// Helper for default rows
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

const Quotation = ({ navigation }) => {
  // Client Info State (UPDATED to match your requested fields)
  const [clientInfo, setClientInfo] = useState({
    contactNo: '',
    name: '',
    venue: '',
    dateTime: '',
    director: '', // stays empty for placeholder
    noOfGuest: '',
  });

  // State for manual table totals (NEW ADDITION)
  const [manualFoodTotal, setManualFoodTotal] = useState('');
  const [manualDecTotal, setManualDecTotal] = useState('');

  // New State for Service Type (F, D, F+D, F+S)
  const [serviceType, setServiceType] = useState('F');

  // State for Rate Mode ('perhead' | 'perkg')
  const [rateMode, setRateMode] = useState('perhead');

  const [directors, setDirectors] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // State for Per Head extra info
  const [perHeadInfo, setPerHeadInfo] = useState('');

  const [foodRows, setFoodRows] = useState(makeDefaultRows(1));
  const [decRows, setDecRows] = useState(makeDefaultRows(6));

  const [editingCell, setEditingCell] = useState(null); // {table,id,key}

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
  // Helper: update client info cell
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
          // Auto-calculate total
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

  // Auto-calculated totals (used as fallback if manual total is empty)
  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);

  // Determine final total for API and display (Use manual if available, else auto)
  const finalFoodTotal = manualFoodTotal
    ? parseFloat(manualFoodTotal)
    : foodAutoTotal;
  const finalDecTotal = manualDecTotal
    ? parseFloat(manualDecTotal)
    : decAutoTotal;
  const grandTotal = finalFoodTotal + finalDecTotal;

  // Function to prepare data for API
  const preparePayload = () => {
    const totalFood = Math.round(finalFoodTotal);
    const totalDecor = Math.round(finalDecTotal);
    const totalGrand = Math.round(grandTotal);

    // Filter out rows with no data and prepare for API
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
      // Client Info (using updated keys)
      contactNo: clientInfo.contactNo,
      contactName: clientInfo.name, // Sending 'name' as contactName to API for compatibility
      venue: clientInfo.venue,
      dateTime: clientInfo.dateTime,
      director: clientInfo.director,
      guests: clientInfo.noOfGuest,

      // Mode & Service
      rateMode: rateMode,
      serviceType: serviceType, // F, D, F+D, F+S
      perHeadInfo: rateMode === 'perhead' ? perHeadInfo : '',

      // Totals (Using Final calculated/manual totals)
      foodTotal: String(totalFood),
      decorTotal: String(totalDecor),
      grandTotal: String(totalGrand),

      // Details Arrays
      foodDetails: cleanFoodDetails,
      decorationDetails: cleanDecorDetails,
    };

    return data;
  };

  // --- API POST LOGIC ---
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
          // Add any required auth headers here
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
          'Quotation data has been successfully sent to the server. Response: ' +
            (isJson
              ? JSON.stringify(data, null, 2).slice(0, 500) + '...'
              : data),
        );
      } else {
        Alert.alert(
          'API Error',
          `Failed to post data. Status: ${response.status}. Response: ${
            isJson ? JSON.stringify(data, null, 2).slice(0, 500) + '...' : data
          }`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Could not connect to the API server: ' + error.message,
      );
    }
  };
  // -------------------------

  // Updated flex values for columns (Same as previous step's width adjustments)
  const COL_FLEX = {
    s_no: 0.1, // S#
    menu: 0.45, // Menu (Detail) - Reduced
    qty: 0.1, // Qty - Reduced
    rate: 0.15, // Rate - Increased
    total: 0.2, // Total - Increased
  };

  const renderExcelRow = (item, index, rows, setRows, tableName) => {
    const cellKey = key => `${tableName}-${item.id}-${key}`;
    // Total value displayed without decimal point
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
          value={displayTotal} // Rounded total value
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

  // Helper function to render editable table total (NEW ADDITION)
  const renderEditableTableTotal = (
    tableName,
    autoTotal,
    manualTotal,
    setManualTotal,
  ) => {
    const label = tableName === 'food' ? 'Food Total' : 'Decor Total';
    const cellKey = `${tableName}-table-total`;
    const displayValue = manualTotal || String(Math.round(autoTotal));

    return (
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{label}:</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.totalCell,
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
              style={styles.totalInput}
            />
          ) : (
            <Text style={styles.totalValue}>{displayValue}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTable = (rows, setRows, title, autoTotal, tableName) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title} {rateMode === 'perhead' ? '(Per Head)' : '(Per KG)'}
      </Text>

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
        scrollEnabled={false} // Use parent ScrollView
      />

      <TouchableOpacity
        style={styles.addRowBtn}
        onPress={() => addRow(rows, setRows)}
      >
        <Text style={styles.addRowText}>+ Add Row</Text>
      </TouchableOpacity>

      {/* Editable Total Row */}
      {tableName === 'food'
        ? renderEditableTableTotal(
            'food',
            autoTotal,
            manualFoodTotal,
            setManualFoodTotal,
          )
        : renderEditableTableTotal(
            'dec',
            autoTotal,
            manualDecTotal,
            setManualDecTotal,
          )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quotation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* --- Client Information Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>

          {/* Row 1: Contact No, Name, Venue */}
          <View style={styles.topGrid}>
            <TextInput
              style={styles.topCell}
              placeholder="Contact No."
              placeholderTextColor="#999"
              value={clientInfo.contactNo}
              keyboardType="phone-pad"
              onChangeText={t => updateClientInfo('contactNo', t)}
            />
            <TextInput
              style={styles.topCell}
              placeholder="Name"
              placeholderTextColor="#999"
              value={clientInfo.name}
              onChangeText={t => updateClientInfo('name', t)}
            />
            <TextInput
              style={styles.topCell}
              placeholder="Venue"
              placeholderTextColor="#999"
              value={clientInfo.venue}
              onChangeText={t => updateClientInfo('venue', t)}
            />
          </View>

          {/* Row 2: Date & Time, Director, No of Guest */}
          <View style={styles.topGrid}>
            {/* DateTime Picker Input */}
            <TouchableOpacity
              style={[styles.topCell, { justifyContent: 'center' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{ color: clientInfo.dateTime ? COLORS.BLACK : '#999' }}
              >
                {clientInfo.dateTime || 'Date & Time'}
              </Text>
            </TouchableOpacity>

            {/* Director Dropdown */}
            <View
              style={[styles.topCell, { padding: 0, justifyContent: 'center' }]}
            >
              <Picker
                selectedValue={clientInfo.director}
                onValueChange={value => updateClientInfo('director', value)}
                dropdownIconColor={COLORS.PRIMARY_DARK}
                style={{ color: clientInfo.director ? COLORS.BLACK : '#999' }}
              >
                <Picker.Item label="Select Director" value="" color="#999" />
                {directors.map(d => (
                  <Picker.Item
                    key={d.combo_code}
                    label={d.description}
                    value={d.combo_code}
                  />
                ))}
              </Picker>
            </View>

            {/* No of Guest Input */}
            <TextInput
              style={styles.topCell}
              placeholder="No of Guest"
              placeholderTextColor="#999"
              value={clientInfo.noOfGuest}
              keyboardType="numeric"
              onChangeText={t => updateClientInfo('noOfGuest', t)}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                clientInfo.dateTime ? new Date(clientInfo.dateTime) : new Date()
              }
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                // ✅ Handle missing event safely
                if (!event || event.type === 'dismissed' || !selectedDate) {
                  setShowDatePicker(false);
                  return;
                }

                if (event.type === 'set' && selectedDate) {
                  const formatted = selectedDate.toLocaleString();
                  updateClientInfo('dateTime', formatted);
                }

                // ✅ Always close picker after use
                setShowDatePicker(false);
              }}
            />
          )}

          {/* Row 3: Per Head/Per Kg Selector */}
          <View style={[styles.topGrid, { alignItems: 'center' }]}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              {['perhead', 'perkg'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setRateMode(mode)}
                  style={[
                    styles.modeOption,
                    { flex: 1, marginHorizontal: 4 },
                    rateMode === mode ? styles.modeOptionActive : null,
                  ]}
                >
                  <Text
                    style={
                      rateMode === mode
                        ? styles.modeOptionTextActive
                        : styles.modeOptionText
                    }
                  >
                    {mode === 'perhead' ? 'Per Head' : 'Per KG'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service Type Radio Buttons */}
          <View
            style={[
              styles.topGrid,
              {
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              },
            ]}
          >
            {['F', 'D', 'F+D', 'F+S'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setServiceType(s)}
                style={[
                  styles.serviceBtn,
                  { flex: 1, marginHorizontal: 4 },
                  serviceType === s ? styles.serviceBtnActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.serviceBtnText,
                    serviceType === s
                      ? { color: COLORS.WHITE }
                      : { color: COLORS.PRIMARY_DARK },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* --- End Client Information Section --- */}

        {/* --- Tables Section (Visible for both perhead and perkg) --- */}
        {rateMode && serviceType ? (
          <>
            {/* FOOD TABLE */}
            {(serviceType.includes('F') || serviceType.includes('S')) &&
              renderTable(
                foodRows,
                setFoodRows,
                'Food Details',
                foodAutoTotal,
                'food',
              )}

            {/* DECORATION TABLE */}
            {serviceType.includes('D') &&
              renderTable(
                decRows,
                setDecRows,
                'Decoration Details',
                decAutoTotal,
                'dec',
              )}

            {/* Per Head Info Area (Only for Per Head mode) */}
            {rateMode === 'perhead' && (
              <View style={[styles.section, { padding: 12 }]}>
                <Text style={styles.totalLabel}>
                  Per Head Additional Information
                </Text>
                <TextInput
                  style={styles.perHeadInfoInput}
                  placeholder="Enter specific per-head menu or notes here..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                  value={perHeadInfo}
                  onChangeText={setPerHeadInfo}
                />
              </View>
            )}

            {/* GRAND TOTAL */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              {/* Rounded grand total value */}
              <Text style={styles.grandValue}>{Math.round(grandTotal)}</Text>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.modeNoteText}>
              Please select **Per Head** or **Per KG** and **Service Type** to
              view/fill quotation details.
            </Text>
          </View>
        )}

        {/* Save Button (Last in ScrollView) */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Quotation Data</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default Quotation;

// STYLES (Combined and adjusted)
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.GRAY_LIGHT },
  header: {
    height: 60,
    backgroundColor: COLORS.PRIMARY_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
  container: { padding: 12 },

  // --- Client Info Styles ---
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
  },
  modeOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  modeOptionText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: '600',
    fontSize: 14,
  },
  modeOptionTextActive: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 14,
  },
  serviceBtn: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_DARK,
    alignItems: 'center',
  },
  serviceBtnActive: {
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  serviceBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  modeNoteText: {
    textAlign: 'center',
    color: COLORS.GRAY_DARK,
    marginTop: 8,
    fontStyle: 'italic',
  },
  perHeadInfoInput: {
    minHeight: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#eee',
    color: COLORS.BLACK,
    marginTop: 8,
  },
  // --- END Client Info Styles ---

  section: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
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

  addRowBtn: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addRowText: { color: COLORS.WHITE, fontWeight: '700' },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 4,
  },
  totalLabel: { fontWeight: '700', color: COLORS.PRIMARY_DARK, fontSize: 14 },
  totalCell: {
    minWidth: 80, // Allow space for input
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f0f0f0', // Slight background to show editable area
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalValue: { fontWeight: '700', color: COLORS.BLACK, fontSize: 14 },
  totalInput: {
    padding: 0,
    height: 20,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.BLACK,
    fontSize: 14,
  },

  grandTotalRow: {
    backgroundColor: COLORS.PRIMARY_DARK,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12, // Space before Save button
  },
  grandLabel: { color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
  grandValue: { color: COLORS.ACCENT, fontSize: 18, fontWeight: '700' },

  saveBtn: {
    backgroundColor: COLORS.ACCENT,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: '800',
    fontSize: 16,
  },
});
