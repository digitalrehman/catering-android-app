import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  FlatList,
  ToastAndroid,
  Keyboard,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../utils/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../../components/AppHeader';
import { useSelector } from 'react-redux';
import styles from './quotationStyle';
import { useRoute } from '@react-navigation/native';

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

const ExcelCell = memo(
  ({
    value,
    onChange,
    keyboardType = 'default',
    onRequestEdit,
    isEditing,
    highlight,
    flex,
    placeholder = '',
  }) => {
    const textInputRef = useRef(null);
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    useEffect(() => {
      if (isEditing && textInputRef.current) {
        const timeout = setTimeout(() => {
          textInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timeout);
      }
    }, [isEditing]);

    const handleTextChange = text => {
      setLocalValue(text);
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (localValue !== value) onChange(localValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleSubmitEditing = () => {
      onChange(localValue);
    };

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          styles.cell,
          highlight && { borderColor: COLORS.ACCENT, borderWidth: 2 },
          { flex },
        ]}
        onPress={() => {
          onRequestEdit && onRequestEdit();
        }}
      >
        {isEditing ? (
          <TextInput
            ref={textInputRef}
            value={localValue}
            style={styles.cellInput}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onSubmitEditing={handleSubmitEditing}
            keyboardType={keyboardType}
            returnKeyType="done"
            placeholder={placeholder}
            blurOnSubmit={false} // ✅ Yeh bhi important hai
            showSoftInputOnFocus={true}
            selectTextOnFocus={true}
            importantForAutofill="no"
            autoCorrect={false}
            autoCapitalize="none"
          />
        ) : (
          <Text style={styles.cellText}>{value}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

// ✅ FIXED: TableRow Component
const TableRow = memo(
  ({ item, index, onUpdateCell, editingCell, setEditingCell, tableName }) => {
    const cellKey = useCallback(
      key => `${tableName}-${item.id}-${key}`,
      [tableName, item.id],
    );

    const handleCellPress = useCallback(
      key => setEditingCell(cellKey(key)),
      [cellKey, setEditingCell],
    );

    const handleUpdateMenu = useCallback(
      t => onUpdateCell(item.id, 'menu', t),
      [onUpdateCell, item.id],
    );

    const handleUpdateQty = useCallback(
      t => onUpdateCell(item.id, 'qty', t),
      [onUpdateCell, item.id],
    );

    const handleUpdateRate = useCallback(
      t => onUpdateCell(item.id, 'rate', t),
      [onUpdateCell, item.id],
    );

    const handleUpdateTotal = useCallback(
      t => onUpdateCell(item.id, 'total', t, true),
      [onUpdateCell, item.id],
    );

    return (
      <View style={styles.row} key={item.id}>
        <View style={[styles.cell, { flex: 0.1 }]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>

        <ExcelCell
          value={item.menu}
          flex={0.45}
          onChange={handleUpdateMenu}
          onRequestEdit={() => handleCellPress('menu')}
          isEditing={editingCell === cellKey('menu')}
          highlight={editingCell === cellKey('menu')}
          placeholder="Detail"
        />

        <ExcelCell
          value={String(item.qty)}
          flex={0.1}
          keyboardType="numeric"
          onChange={handleUpdateQty}
          onRequestEdit={() => handleCellPress('qty')}
          isEditing={editingCell === cellKey('qty')}
          highlight={editingCell === cellKey('qty')}
          placeholder="0"
        />

        <ExcelCell
          value={String(item.rate)}
          flex={0.15}
          keyboardType="numeric"
          onChange={handleUpdateRate}
          onRequestEdit={() => handleCellPress('rate')}
          isEditing={editingCell === cellKey('rate')}
          highlight={editingCell === cellKey('rate')}
          placeholder="0"
        />

        <ExcelCell
          value={item.total ? String(Math.round(parseFloat(item.total))) : ''}
          flex={0.2}
          keyboardType="numeric"
          onChange={handleUpdateTotal}
          onRequestEdit={() => handleCellPress('total')}
          isEditing={editingCell === cellKey('total')}
          highlight={editingCell === cellKey('total')}
          placeholder="0"
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.menu === nextProps.item.menu &&
      prevProps.item.qty === nextProps.item.qty &&
      prevProps.item.rate === nextProps.item.rate &&
      prevProps.item.total === nextProps.item.total &&
      prevProps.editingCell === nextProps.editingCell &&
      prevProps.index === nextProps.index
    );
  },
);

// ✅ FIXED: Radio Button Component
const RadioButtonColumn = memo(({ label, selected, onPress, isRateMode }) => {
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
});

// ✅ PERFECTED: OwnerAmountInput Component
const OwnerAmountInput = memo(({ value, onChange, placeholder, tableName }) => {
  const textInputRef = useRef(null);
  const [localValue, setLocalValue] = useState(String(value ?? ''));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(String(value ?? ''));
  }, [value]);

  const handleChange = text => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    if ((cleaned.match(/\./g) || []).length > 1) return;
    setLocalValue(cleaned);
    onChange(cleaned);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <TextInput
      ref={textInputRef}
      value={localValue}
      onChangeText={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      placeholderTextColor="#666"
      keyboardType="decimal-pad"
      style={styles.ownerInput}
      blurOnSubmit={false}
      returnKeyType="done"
      showSoftInputOnFocus={true}
      selectTextOnFocus={true}
      autoCorrect={false}
      autoCapitalize="none"
      contextMenuHidden={false}
      caretHidden={false}
      onSubmitEditing={() => {
        // Keyboard maintain rahega
        // Kuch bhi na karein ya phir next field pe move karein
      }}
    />
  );
});
const Quotation = ({ navigation }) => {
  const user = useSelector(state => state.Data.currentData);
  const route = useRoute();
  const { eventData } = route.params || {};

  console.log('🚩 Quotation Screen Loaded with eventData:', eventData);
  console.log('🎯 Director Data:', eventData?.originalData?.director_name);

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [perHeadInfo, setPerHeadInfo] = useState('');
  const [perHeadExpanded, setPerHeadExpanded] = useState(false);
  const [foodRows, setFoodRows] = useState(makeDefaultRows(1));
  const [decRows, setDecRows] = useState(makeDefaultRows(6));
  const [editingCell, setEditingCell] = useState(null);
  const [foodOwnerAmount, setFoodOwnerAmount] = useState('');
  const [decOwnerAmount, setDecOwnerAmount] = useState('');
  const [beverageType, setBeverageType] = useState('none');
  const [advanceMode, setAdvanceMode] = useState('none');
  const [cashReceived, setCashReceived] = useState('');
  const [banks, setBanks] = useState([]);
  const [bankSelected, setBankSelected] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [initialAdvance, setInitialAdvance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (
        editingCell &&
        !editingCell.includes('food-table-total') &&
        !editingCell.includes('dec-table-total') &&
        !editingCell.includes('owner-amount')
      ) {
        setEditingCell(null);
      }
    });

    return () => {
      keyboardHideListener.remove();
    };
  }, [editingCell]);

  const showToast = msg => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      console.log('Toast:', msg);
    }
  };

  // ✅ FIXED: Director aur bank data fetch
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Fetch directors
        const directorRes = await fetch(
          'https://cat.de2solutions.com/mobile_dash/director.php',
        );
        const directorJson = await directorRes.json();
        if (
          mounted &&
          directorJson?.status === 'true' &&
          Array.isArray(directorJson.data)
        ) {
          setDirectors(directorJson.data);
        }

        // Fetch banks
        const bankRes = await fetch(
          'https://cat.de2solutions.com/mobile_dash/event_bank.php',
        );
        const bankJson = await bankRes.json();
        if (mounted && bankJson?.status === 'true')
          setBanks(bankJson.data || []);
      } catch (e) {
        console.log('Data fetch error:', e.message || e);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  // ✅ FIXED: Event type detection from API response - IMPROVED
  const detectEventTypeFromResponse = data => {
    const hasFood = data.status_food === 'true' && data.data_food?.length > 0;
    const hasDecoration =
      data.status_decoration === 'true' && data.data_decoration?.length > 0;
    const hasBeverages =
      data.status_beverages === 'true' && data.data_beverages?.length > 0;

    console.log('🔍 Event Type Detection:', {
      hasFood,
      hasDecoration,
      hasBeverages,
    });

    if (hasFood && hasDecoration) return 'F+D';
    if (hasFood && !hasDecoration) return 'F';
    if (!hasFood && hasDecoration) return 'D';
    return 'F'; // default
  };

  // ✅ FIXED: Rate mode detection from API response
  const detectRateModeFromResponse = data => {
    // Check if any item has "Per Head" in description
    const allItems = [
      ...(data.data_food || []),
      ...(data.data_decoration || []),
      ...(data.data_beverages || []),
    ];

    const hasPerHead = allItems.some(item =>
      item.description?.toLowerCase().includes('per head'),
    );

    console.log('💰 Rate Mode Detection - Has Per Head:', hasPerHead);

    return hasPerHead ? 'perhead' : 'perkg';
  };

  // ✅ FIXED: Beverage type detection from API response
  const detectBeverageTypeFromResponse = data => {
    if (data.status_beverages === 'true' && data.data_beverages?.length > 0) {
      const beverageItem = data.data_beverages[0];
      const beverageDesc = beverageItem.description?.toLowerCase() || '';
      console.log('🥤 Beverage Detection:', beverageDesc);

      if (beverageDesc.includes('can')) return 'can';
      if (beverageDesc.includes('regular')) return 'regular';
    }
    return 'none';
  };

  // ✅ FIXED: Better event details fetching
  const fetchEventDetails = async () => {
    try {
      if (!eventData?.id) return;

      console.log('🔄 Fetching event details for:', eventData.id);

      const formData = new FormData();
      formData.append('order_no', eventData.id);

      const res = await fetch(
        'https://cat.de2solutions.com/mobile_dash/get_event_food_decor_detail.php',
        { method: 'POST', body: formData },
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const text = await res.text();
      console.log('📄 Raw API Response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.log('JSON Parse Error:', parseError);
        return;
      }

      console.log('📊 Parsed API data:', data);

      // ✅ FIXED: Event type detection from API response
      const detectedEventType = detectEventTypeFromResponse(data);
      setServiceType(detectedEventType);
      console.log('🎛️ Detected Service Type:', detectedEventType);

      // ✅ FIXED: Rate mode detection
      const detectedRateMode = detectRateModeFromResponse(data);
      setRateMode(detectedRateMode);
      console.log('💰 Detected Rate Mode:', detectedRateMode);

      // ✅ FIXED: Beverage type detection
      const detectedBeverageType = detectBeverageTypeFromResponse(data);
      setBeverageType(detectedBeverageType);
      console.log('🥤 Detected Beverage Type:', detectedBeverageType);

      let foodPerHeadValue = '';
      let decPerHeadValue = '';
      let specialInstructions = '';

      // ✅ FIXED: Process food data
      if (data.status_food === 'true' && Array.isArray(data.data_food)) {
        const foodItems = data.data_food
          .filter(item => item && item.description)
          .map((item, idx) => {
            const quantity = parseFloat(item.quantity || 0);
            const unitPrice = parseFloat(item.unit_price || 0);

            if (item.description?.toLowerCase().includes('per head')) {
              foodPerHeadValue = String(unitPrice || '');
              return null;
            }

            if (
              item.description?.toLowerCase().includes('special instruction')
            ) {
              specialInstructions = item.description
                .replace('Special Instructions:', '')
                .trim();
              return null;
            }

            return {
              id: String(idx + 1),
              menu: item.description?.trim() || '',
              qty: quantity > 0 ? String(quantity) : '',
              rate: unitPrice > 0 ? String(unitPrice) : '',
              total:
                quantity > 0 && unitPrice > 0
                  ? (quantity * unitPrice).toFixed(2)
                  : '',
              manualTotal: false,
            };
          })
          .filter(item => item !== null);

        setFoodRows(foodItems.length > 0 ? foodItems : makeDefaultRows(1));
        console.log('🍕 Food rows set:', foodItems);
      }

      // ✅ FIXED: Process decoration data - F+S ke liye bhi
      if (
        data.status_decoration === 'true' &&
        Array.isArray(data.data_decoration)
      ) {
        const decItems = data.data_decoration
          .filter(item => item && item.description)
          .map((item, idx) => {
            const quantity = parseFloat(item.quantity || 0);
            const unitPrice = parseFloat(item.unit_price || 0);

            if (item.description?.toLowerCase().includes('per head')) {
              decPerHeadValue = String(unitPrice || '');
              return null;
            }

            if (
              item.description?.toLowerCase().includes('special instruction')
            ) {
              return null;
            }

            return {
              id: String(idx + 6),
              menu: item.description?.trim() || '',
              qty: quantity > 0 ? String(quantity) : '',
              rate: unitPrice > 0 ? String(unitPrice) : '',
              total:
                quantity > 0 && unitPrice > 0
                  ? (quantity * unitPrice).toFixed(2)
                  : '',
              manualTotal: false,
            };
          })
          .filter(item => item !== null);

        setDecRows(decItems.length > 0 ? decItems : makeDefaultRows(6));
        console.log('🎨 Decor rows set:', decItems);
      }

      // ✅ FIXED: Director name issue - PROPERLY FIXED
      const directorId =
        eventData?.originalData?.director_id || eventData?.director_id;
      console.log('🎯 Director ID:', directorId);

      let directorNameToShow = '';
      if (directorId && directors.length > 0) {
        const foundDirector = directors.find(d => d.combo_code == directorId);
        directorNameToShow = foundDirector
          ? foundDirector.description
          : directorId;
      } else {
        directorNameToShow = eventData?.originalData?.director_name || '';
      }

      console.log('🎯 Setting director:', directorNameToShow);

      // ✅ FIXED: Client info with proper director data
      setClientInfo({
        contactNo: eventData.contact_no || '',
        name: eventData.name || '',
        venue: eventData.venue || '',
        dateTime: eventData.date || '',
        director: directorNameToShow,
        noOfGuest: eventData.guest || '',
      });

      // Set other states
      setFoodOwnerAmount(foodPerHeadValue);
      setDecOwnerAmount(decPerHeadValue);
      setManualFoodTotal(eventData.total || '');
      setPerHeadInfo(specialInstructions);

      const advanceAmount = eventData.advance || '0';
      setCashReceived(advanceAmount);
      setInitialAdvance(parseFloat(advanceAmount) || 0);

      // ✅ FIXED: Advance mode - PROPERLY FIXED
      console.log('💳 Advance Details:', {
        bank_id: eventData.bank_id,
        advance: eventData.advance,
        bankSelected: bankSelected,
      });

      if (eventData.bank_id && eventData.bank_id !== '0') {
        setAdvanceMode('bank');
        setBankSelected(String(eventData.bank_id));
        setBankAmount(advanceAmount);
        console.log('🏦 Bank Mode Set with ID:', eventData.bank_id);
      } else if (advanceAmount && parseFloat(advanceAmount) > 0) {
        setAdvanceMode('cash');
        console.log('💵 Cash Mode Set');
      } else {
        setAdvanceMode('none');
        console.log('❌ No Advance Mode');
      }
    } catch (err) {
      console.log('Error fetching event details:', err);
    }
  };

  useEffect(() => {
    if (!eventData?.id) return;
    fetchEventDetails();
  }, [eventData, directors]); // ✅ directors ko dependency mein add kiya

  const updateClientInfo = useCallback((key, value) => {
    setClientInfo(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateRow = useCallback(
    (rowsSetter, id, key, value, markManual = false) => {
      rowsSetter(prev => {
        const idx = prev.findIndex(r => r.id === id);
        if (idx === -1) return prev;

        const currentItem = prev[idx];
        if (currentItem[key] === value) return prev;

        const next = [...prev];
        const item = { ...next[idx] };
        item[key] = value;
        if (markManual) item.manualTotal = true;

        if (!item.manualTotal && (key === 'qty' || key === 'rate')) {
          const q = parseFloat(item.qty || 0);
          const rt = parseFloat(item.rate || 0);
          item.total = !isNaN(q) && !isNaN(rt) ? (q * rt).toFixed(2) : '';
        }
        next[idx] = item;
        return next;
      });
    },
    [],
  );

  const addRow = useCallback((rows, setRows) => {
    const maxId =
      rows.length > 0 ? Math.max(...rows.map(r => parseInt(r.id, 10))) : 0;
    const nextId = maxId + 1;

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
  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);
  const foodOwnerTotal = (parseFloat(foodOwnerAmount || 0) || 0) * guestsCount;
  const decOwnerTotal = (parseFloat(decOwnerAmount || 0) || 0) * guestsCount;
  const beverageRate =
    beverageType === 'regular' ? 250 : beverageType === 'can' ? 300 : 0;
  const beverageTotal = beverageRate * guestsCount;
  const finalFoodTotal = manualFoodTotal
    ? parseFloat(manualFoodTotal)
    : foodAutoTotal + foodOwnerTotal;
  const finalDecTotal = manualDecTotal
    ? parseFloat(manualDecTotal)
    : decAutoTotal + decOwnerTotal;
  const grandTotal = finalFoodTotal + finalDecTotal + beverageTotal;

  const advancePaid =
    advanceMode === 'cash'
      ? parseFloat(cashReceived || 0) || 0
      : advanceMode === 'bank'
      ? parseFloat(bankAmount || 0) || 0
      : initialAdvance;

  const remainingBalance = Math.max(0, grandTotal - advancePaid);

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
    setInitialAdvance(0);
  };

  // ✅ FIXED: Save handler with ALL issues fixed
  const handleSave = async () => {
    if (
      !clientInfo.contactNo ||
      !clientInfo.name ||
      !clientInfo.venue ||
      !rateMode ||
      !serviceType
    ) {
      showToast('Please fill all client details before saving.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Basic info
      formData.append('party_name', clientInfo.name);
      formData.append('contact_no', clientInfo.contactNo);
      formData.append('venue', clientInfo.venue);
      formData.append('guest', clientInfo.noOfGuest || 0);

      // ✅ FIXED: Director ID properly set karo
      const directorObj = directors.find(
        d => d.description === clientInfo.director,
      );
      const directorId = directorObj ? directorObj.combo_code : '0';
      formData.append('director_id', directorId);

      formData.append('total', Math.round(grandTotal));
      formData.append('so_advance', Math.round(advancePaid));
      formData.append('user_id', Number(user?.id) || 12);

      // ✅ FIXED: Comments field add karo
      if (perHeadInfo.trim()) {
        formData.append('comments', perHeadInfo.trim());
        console.log('📝 Comments sent:', perHeadInfo.trim());
      }

      // Date time
      if (clientInfo.dateTime) {
        const dateObj = new Date(clientInfo.dateTime);
        const datePart = dateObj.toISOString().split('T')[0];
        const timePart = dateObj.toLocaleTimeString('en-GB', { hour12: false });
        formData.append('function_date', datePart);
        formData.append('f_time', timePart);
      }

      // Event type mapping
      const eventTypeMap = { D: '1', F: '2', 'F+D': '3', 'F+S': '4' };
      formData.append('event_type', eventTypeMap[serviceType] || '2');
      console.log(
        '🎯 Sending Event Type:',
        serviceType,
        '->',
        eventTypeMap[serviceType],
      );

      const salesTypeMap = { perkg: '1', perhead: '4' };
      formData.append('sales_type', salesTypeMap[rateMode] || '4');
      console.log(
        '💰 Sending Rate Mode:',
        rateMode,
        '->',
        salesTypeMap[rateMode],
      );

      formData.append(
        'bank_id',
        advanceMode === 'bank' ? Number(bankSelected) || 0 : 0,
      );
      console.log(
        '🏦 Sending Bank ID:',
        advanceMode === 'bank' ? bankSelected : 0,
      );

      const updateId = eventData?.id ? Number(eventData.id) : 0;
      formData.append('update_id', updateId);

      const salesOrderDetails = [];

      // Food rows - table ki details
      foodRows
        .filter(
          r =>
            r.menu &&
            r.menu.trim() !== '' &&
            !r.menu.toLowerCase().includes('per head'),
        )
        .forEach(r => {
          salesOrderDetails.push({
            description: r.menu,
            quantity: r.qty && r.qty.trim() !== '' ? r.qty : '0',
            unit_price: r.rate && r.rate.trim() !== '' ? r.rate : '0',
            text1: 'F',
          });
        });

      // ✅ FIXED: Decor/Service rows - F+S ke liye 'S' send karo
      decRows
        .filter(
          r =>
            r.menu &&
            r.menu.trim() !== '' &&
            !r.menu.toLowerCase().includes('per head'),
        )
        .forEach(r => {
          const text1 = serviceType === 'F+S' ? 'S' : 'D'; // ✅ F+S ke liye 'S' send karo
          salesOrderDetails.push({
            description: r.menu,
            quantity: r.qty && r.qty.trim() !== '' ? r.qty : '0',
            unit_price: r.rate && r.rate.trim() !== '' ? r.rate : '0',
            text1,
          });
        });

      // Per-head items
      if (rateMode === 'perhead') {
        if (foodOwnerAmount && parseFloat(foodOwnerAmount) > 0) {
          salesOrderDetails.push({
            description: 'Food Per Head',
            quantity: clientInfo.noOfGuest || 0,
            unit_price: foodOwnerAmount,
            text1: 'F',
          });
        }

        if (decOwnerAmount && parseFloat(decOwnerAmount) > 0) {
          const text1 = serviceType === 'F+S' ? 'S' : 'D'; // ✅ F+S ke liye 'S' send karo
          salesOrderDetails.push({
            description:
              serviceType === 'F+S'
                ? 'Services Per Head'
                : 'Decoration Per Head',
            quantity: clientInfo.noOfGuest || 0,
            unit_price: decOwnerAmount,
            text1,
          });
        }

        if (beverageType !== 'none') {
          const beverageDesc =
            beverageType === 'regular'
              ? 'Beverages Per Head Regular'
              : 'Beverages Per Head Can';
          salesOrderDetails.push({
            description: beverageDesc,
            quantity: clientInfo.noOfGuest || 0,
            unit_price: beverageType === 'regular' ? '250' : '300',
            text1: 'B',
          });
        }
      }

      console.log('📤 Sending sales order details:', salesOrderDetails);
      console.log('🎯 Service Type:', serviceType);
      console.log('💰 Rate Mode:', rateMode);
      console.log('🥤 Beverage Type:', beverageType);
      console.log('💳 Advance Mode:', advanceMode);

      if (salesOrderDetails.length > 0) {
        formData.append(
          'sales_order_details',
          JSON.stringify(salesOrderDetails),
        );
      }

      const response = await fetch(
        'https://cat.de2solutions.com/mobile_dash/post_event_quotation.php',
        { method: 'POST', body: formData },
      );

      const text = await response.text();
      console.log('📥 Server response:', text);

      let responseData;
      try {
        responseData = JSON.parse(text);
        console.log('📊 Parsed Response:', responseData);
      } catch {
        responseData = { message: text };
        console.log('❌ JSON Parse Failed, raw response:', text);
      }

      if (response.ok && responseData?.status !== 'false') {
        showToast(
          updateId === 0
            ? 'Quotation successfully added.'
            : 'Quotation successfully updated.',
        );
        resetForm();
        navigation.navigate('EventCalendar');
      } else {
        showToast(responseData?.message || 'Failed to save quotation.');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast(`Save failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const COL_FLEX = { s_no: 0.1, menu: 0.45, qty: 0.1, rate: 0.15, total: 0.2 };

  // ✅ FIXED: Table Component
  const TableComponent = memo(
    ({ rows, setRows, title, autoTotal, tableName }) => {
      const renderRow = ({ item, index }) => (
        <TableRow
          item={item}
          index={index}
          onUpdateCell={(id, key, value, markManual) =>
            updateRow(setRows, id, key, value, markManual)
          }
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          tableName={tableName}
        />
      );

      return (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {title} {rateMode === 'perhead' ? '(Per Head)' : '(Per KG)'}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { flex: COL_FLEX.s_no }]}>S#</Text>
            <Text style={[styles.headerCell, { flex: COL_FLEX.menu }]}>
              Detail
            </Text>
            <Text style={[styles.headerCell, { flex: COL_FLEX.qty }]}>Qty</Text>
            <Text style={[styles.headerCell, { flex: COL_FLEX.rate }]}>
              Rate
            </Text>
            <Text style={[styles.headerCell, { flex: COL_FLEX.total }]}>
              Total
            </Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={item => `${tableName}-${item.id}`}
            renderItem={renderRow}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            style={{ maxHeight: rows.length * 50 }}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={8}
            removeClippedSubviews={Platform.OS === 'android'}
          />

          <View style={styles.addAndTotalsRow}>
            <TouchableOpacity
              style={styles.smallAddLeft}
              onPress={() => addRow(rows, setRows)}
            >
              <Ionicons name="add" size={18} color={COLORS.WHITE} />
            </TouchableOpacity>

            <View style={styles.ownerAmountWrap}>
              <OwnerAmountInput
                value={tableName === 'food' ? foodOwnerAmount : decOwnerAmount}
                onChange={
                  tableName === 'food' ? setFoodOwnerAmount : setDecOwnerAmount
                }
                placeholder="0"
                tableName={tableName} // ✅ Add this prop
              />
            </View>

            {tableName === 'food' ? (
              <View style={styles.totalInlineRow}>
                <Text style={styles.totalLabelSmall}>Food Total:</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.totalCellSmall,
                    editingCell === 'food-table-total' && {
                      borderColor: COLORS.ACCENT,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setEditingCell('food-table-total')}
                >
                  {editingCell === 'food-table-total' ? (
                    <TextInput
                      autoFocus
                      value={manualFoodTotal}
                      onChangeText={setManualFoodTotal}
                      keyboardType="numeric"
                      onBlur={() => setEditingCell(null)}
                      style={styles.totalInputSmall}
                      onTouchStart={e => e.stopPropagation()}
                      onFocus={e => e.stopPropagation()}
                    />
                  ) : (
                    <Text style={styles.totalValueSmall}>
                      {manualFoodTotal ||
                        String(
                          Math.round(autoTotal + Math.round(foodOwnerTotal)),
                        )}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.totalInlineRow}>
                <Text style={styles.totalLabelSmall}>
                  {serviceType === 'F+S' ? 'Services Total' : 'Decor Total'}:
                </Text>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.totalCellSmall,
                    editingCell === 'dec-table-total' && {
                      borderColor: COLORS.ACCENT,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setEditingCell('dec-table-total')}
                >
                  {editingCell === 'dec-table-total' ? (
                    <TextInput
                      autoFocus
                      value={manualDecTotal}
                      onChangeText={setManualDecTotal}
                      keyboardType="numeric"
                      onBlur={() => setEditingCell(null)}
                      style={styles.totalInputSmall}
                      onTouchStart={e => e.stopPropagation()}
                      onFocus={e => e.stopPropagation()}
                    />
                  ) : (
                    <Text style={styles.totalValueSmall}>
                      {manualDecTotal ||
                        String(
                          Math.round(autoTotal + Math.round(decOwnerTotal)),
                        )}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    },
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

  const openDatePicker = mode => {
    setDatePickerMode(mode);
    setTempDate(
      clientInfo.dateTime ? new Date(clientInfo.dateTime) : new Date(),
    );
    setShowDatePicker(true);
  };

  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') {
      if (!selected) {
        setShowDatePicker(false);
        return;
      }
    }
    const value = selected || tempDate;
    setTempDate(value);

    if (datePickerMode === 'date') {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        setTimeout(() => {
          setDatePickerMode('time');
          setShowDatePicker(true);
        }, 250);
        return;
      }
    } else if (datePickerMode === 'time') {
      const merged = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        value.getHours(),
        value.getMinutes(),
      );
      updateClientInfo('dateTime', merged.toISOString());
      setShowDatePicker(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Quotation" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
      >
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
                onFocus={() => setEditingCell(null)}
              />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#b0b0b0"
                value={clientInfo.name}
                onChangeText={t => updateClientInfo('name', t)}
                onFocus={() => setEditingCell(null)}
              />
            </View>

            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => {
                  setEditingCell(null);
                  openDatePicker('date');
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
                onFocus={() => setEditingCell(null)}
              />
            </View>

            <View style={styles.inputRow}>
              <View
                style={[styles.input, { padding: 0, justifyContent: 'center' }]}
              >
                <Picker
                  selectedValue={clientInfo.director}
                  onValueChange={value => {
                    setEditingCell(null);
                    updateClientInfo('director', value);
                  }}
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
                      value={d.description}
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
                onFocus={() => setEditingCell(null)}
              />
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode={datePickerMode}
              display={
                Platform.OS === 'android'
                  ? datePickerMode === 'date'
                    ? 'calendar'
                    : 'clock'
                  : 'spinner'
              }
              onChange={onDateChange}
              is24Hour={false}
            />
          )}

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
                    setEditingCell(null);
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
            {(serviceType === 'F' ||
              serviceType === 'F+D' ||
              serviceType === 'F+S') && (
              <>
                <TableComponent
                  rows={foodRows}
                  setRows={setFoodRows}
                  title="Food Details"
                  autoTotal={foodAutoTotal}
                  tableName="food"
                />

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
                      onPress={() => {
                        setEditingCell(null);
                        setBeverageType(prev =>
                          prev === 'regular' ? 'none' : 'regular',
                        );
                      }}
                    >
                      <Ionicons
                        name={
                          beverageType === 'regular'
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={18}
                        color={COLORS.PRIMARY_DARK}
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
                      onPress={() => {
                        setEditingCell(null);
                        setBeverageType(prev =>
                          prev === 'can' ? 'none' : 'can',
                        );
                      }}
                    >
                      <Ionicons
                        name={
                          beverageType === 'can' ? 'checkbox' : 'square-outline'
                        }
                        size={18}
                        color={COLORS.PRIMARY_DARK}
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

            {(serviceType === 'D' ||
              serviceType === 'F+D' ||
              serviceType === 'F+S') && (
              <TableComponent
                rows={decRows}
                setRows={setDecRows}
                title={
                  serviceType === 'F+S'
                    ? 'Services Details'
                    : 'Decoration Details'
                }
                autoTotal={decAutoTotal}
                tableName="dec"
              />
            )}

            {rateMode === 'perhead' && (
              <View style={[styles.section, { padding: 12 }]}>
                <Text style={styles.totalLabel}>Special Instructions</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setEditingCell(null);
                    setPerHeadExpanded(v => !v);
                  }}
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
                    onFocus={() => {
                      setEditingCell(null);
                      setPerHeadExpanded(true);
                    }}
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
                  onPress={() => {
                    setEditingCell(null);
                    setAdvanceMode('cash');
                  }}
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
                  onPress={() => {
                    setEditingCell(null);
                    setAdvanceMode('bank');
                  }}
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
                    onFocus={() => setEditingCell(null)}
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
                      onValueChange={value => {
                        setEditingCell(null);
                        setBankSelected(value);
                      }}
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
                      onFocus={() => setEditingCell(null)}
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

      <Modal transparent visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 25,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={COLORS.ACCENT} />
            <Text style={{ marginTop: 10, color: COLORS.PRIMARY_DARK }}>
              Saving quotation...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Quotation;
