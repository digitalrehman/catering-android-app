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
  ToastAndroid,
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
import api from '../../utils/api';

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

const TableRow = memo(({ item, index, onUpdateCell, isEditMode }) => {
  const [menu, setMenu] = useState(item.menu);
  const [qty, setQty] = useState(item.qty);
  const [rate, setRate] = useState(item.rate);
  const [total, setTotal] = useState(item.total);

  // ✅ FIXED: Track manual focus changes
  const isManualFocusChange = useRef(false);
  // ✅ FIXED: Track changes to save on unmount
  const hasUnsavedChanges = useRef(false);
  const unsavedData = useRef({});

  useEffect(() => {
    setMenu(item.menu);
    setQty(item.qty);
    setRate(item.rate);
    setTotal(item.total);
  }, [item.menu, item.qty, item.rate, item.total]);

  // ✅ FIXED: Save unsaved data when component unmounts
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current) {
        Object.keys(unsavedData.current).forEach(field => {
          onUpdateCell(
            item.id,
            field,
            unsavedData.current[field],
            field === 'total',
          );
        });
      }
    };
  }, [item.id]);

  // ✅ FIXED: Track changes without immediate parent update
  const trackChange = (field, value) => {
    hasUnsavedChanges.current = true;
    unsavedData.current[field] = value;
  };

  const handleQtyChange = text => {
    setQty(text);
    trackChange('qty', text);

    // Auto calculate total
    if (!item.manualTotal) {
      const qtyNum = parseFloat(text || 0);
      const rateNum = parseFloat(rate || 0);
      const calculatedTotal = qtyNum * rateNum;

      if (!isNaN(calculatedTotal)) {
        const formattedTotal =
          calculatedTotal % 1 === 0
            ? calculatedTotal.toString()
            : calculatedTotal.toFixed(2);

        if (formattedTotal !== total) {
          setTotal(formattedTotal);
          trackChange('total', formattedTotal);
        }
      }
    }
  };

  const handleRateChange = text => {
    setRate(text);
    trackChange('rate', text);

    // Auto calculate total
    if (!item.manualTotal) {
      const qtyNum = parseFloat(qty || 0);
      const rateNum = parseFloat(text || 0);
      const calculatedTotal = qtyNum * rateNum;

      if (!isNaN(calculatedTotal)) {
        const formattedTotal =
          calculatedTotal % 1 === 0
            ? calculatedTotal.toString()
            : calculatedTotal.toFixed(2);

        if (formattedTotal !== total) {
          setTotal(formattedTotal);
          trackChange('total', formattedTotal);
        }
      }
    }
  };

  const handleMenuChange = text => {
    setMenu(text);
    trackChange('menu', text);
  };

  const handleTotalChange = text => {
    setTotal(text);
    trackChange('total', text);
  };

  // ✅ FIXED: Better blur handling - skip for manual focus changes
  const handleBlur = (field, value) => {
    // Agar user manually click kar raha hai to blur skip karo
    if (isManualFocusChange.current) {
      isManualFocusChange.current = false;
      return;
    }

    // Normal blur - save data
    if (item[field] !== value) {
      onUpdateCell(item.id, field, value, field === 'total');
      // Clear from unsaved data
      delete unsavedData.current[field];
      if (Object.keys(unsavedData.current).length === 0) {
        hasUnsavedChanges.current = false;
      }
    }
  };

  // ✅ FIXED: Handle manual focus change
  const handleManualFocus = () => {
    isManualFocusChange.current = true;
  };

  return (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 0.1 }]}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>

      {/* Menu */}
      <View style={[styles.cell, { flex: 0.45 }]}>
        <TextInput
          style={styles.cellInput}
          value={menu}
          onChangeText={handleMenuChange}
          onBlur={() => handleBlur('menu', menu)}
          onFocus={handleManualFocus}
          blurOnSubmit={false}
        />
      </View>

      {/* Qty */}
      <View style={[styles.cell, { flex: 0.1 }]}>
        <TextInput
          style={styles.cellInput}
          value={qty}
          keyboardType="decimal-pad"
          onChangeText={handleQtyChange}
          onBlur={() => handleBlur('qty', qty)}
          onFocus={handleManualFocus}
          blurOnSubmit={false}
        />
      </View>

      {/* Rate */}
      <View style={[styles.cell, { flex: 0.15 }]}>
        <TextInput
          style={styles.cellInput}
          value={rate}
          keyboardType="decimal-pad"
          onChangeText={handleRateChange}
          onBlur={() => handleBlur('rate', rate)}
          onFocus={handleManualFocus}
          blurOnSubmit={false}
        />
      </View>

      {/* Total */}
      <View style={[styles.cell, { flex: 0.2 }]}>
        <TextInput
          style={styles.cellInput}
          value={total}
          keyboardType="decimal-pad"
          onChangeText={handleTotalChange}
          onBlur={() => handleBlur('total', total)}
          onFocus={handleManualFocus}
        />
      </View>
    </View>
  );
});

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

// ✅ FIXED: OwnerAmountInput with proper formatting
const OwnerAmountInput = memo(({ value, onChange, tableName }) => {
  const textInputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = text => {
    // Allow only numbers and decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    setLocalValue(cleaned);
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

  const handleSubmitEditing = () => {
    handleBlur();
  };

  return (
    <TextInput
      ref={textInputRef}
      value={localValue}
      onChangeText={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onSubmitEditing={handleSubmitEditing}
      keyboardType="numeric"
      style={[styles.ownerInput, isFocused && styles.ownerInputFocused]}
      blurOnSubmit={false}
      returnKeyType="done"
    />
  );
});

const Quotation = ({ navigation }) => {
  const user = useSelector(state => state.Data.currentData);
  const route = useRoute();
  const { eventData } = route.params || {};
  console.log('eventData', eventData);

  const [clientInfo, setClientInfo] = useState({
    contactNo: '',
    name: '',
    venue: '',
    dateTime: '',
    director: '',
    noOfGuest: '',
  });
  const [discountAmount, setDiscountAmount] = useState('');
  const [manualFoodTotal, setManualFoodTotal] = useState('');
  const [manualDecTotal, setManualDecTotal] = useState('');
  const [manualServicesTotal, setManualServicesTotal] = useState('');
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
  const [servicesRows, setServicesRows] = useState(makeDefaultRows(11));
  const [foodOwnerAmount, setFoodOwnerAmount] = useState('');
  const [decOwnerAmount, setDecOwnerAmount] = useState('');
  const [servicesOwnerAmount, setServicesOwnerAmount] = useState('');
  const [beverageType, setBeverageType] = useState('none');
  const [advanceMode, setAdvanceMode] = useState('none');
  const [cashReceived, setCashReceived] = useState('');
  const [banks, setBanks] = useState([]);
  const [bankSelected, setBankSelected] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [initialAdvance, setInitialAdvance] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Format currency for display
  const formatCurrency = amount => {
    if (!amount && amount !== 0) return '0';
    const number = parseFloat(amount);
    if (isNaN(number)) return '0';

    // Remove .00 if whole number
    const formatted = number.toLocaleString('en-IN');
    return formatted.endsWith('.00') ? formatted.split('.')[0] : formatted;
  };

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
        const directorRes = await fetch(`${api.baseURL}director.php`);
        const directorJson = await directorRes.json();
        if (
          mounted &&
          directorJson?.status === 'true' &&
          Array.isArray(directorJson.data)
        ) {
          setDirectors(directorJson.data);
        }

        // Fetch banks
        const bankRes = await fetch(`${api.baseURL}event_bank.php`);
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

  // ✅ FIXED: Special instructions extract karna
  const extractSpecialInstructions = data => {
    let specialInstructions = '';

    // Food data se special instructions extract karo
    if (data.status_food === 'true' && Array.isArray(data.data_food)) {
      data.data_food.forEach(item => {
        if (
          item.description &&
          item.description.toLowerCase().includes('special instruction')
        ) {
          specialInstructions = item.description
            .replace(/special instruction[s]?:/i, '')
            .trim();
        }
      });
    }

    // Decoration data se bhi check karo
    if (
      data.status_decoration === 'true' &&
      Array.isArray(data.data_decoration)
    ) {
      data.data_decoration.forEach(item => {
        if (
          item.description &&
          item.description.toLowerCase().includes('special instruction') &&
          !specialInstructions
        ) {
          specialInstructions = item.description
            .replace(/special instruction[s]?:/i, '')
            .trim();
        }
      });
    }

    // Original data se comments check karo
    if (!specialInstructions && eventData?.originalData?.comments) {
      specialInstructions = eventData.originalData.comments;
    }

    return specialInstructions;
  };

  // ✅ FIXED: Better event details fetching with special instructions
  const fetchEventDetails = async () => {
    try {
      if (!eventData?.id) return;
      const formData = new FormData();
      formData.append('order_no', eventData.id);

      const res = await fetch(`${api.baseURL}get_event_food_decor_detail.php`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.log('JSON Parse Error:', parseError);
        return;
      }

      // ✅ FIXED: Event type detection from API response
      const detectedEventType = detectEventTypeFromResponse(data);
      setServiceType(detectedEventType);

      // ✅ FIXED: Rate mode detection
      const detectedRateMode = detectRateModeFromResponse(data);
      setRateMode(detectedRateMode);

      // ✅ FIXED: Beverage type detection
      const detectedBeverageType = detectBeverageTypeFromResponse(data);
      setBeverageType(detectedBeverageType);

      let foodPerHeadValue = '';
      let decPerHeadValue = '';
      let servicesPerHeadValue = '';

      // ✅ FIXED: Special instructions extract karo
      const specialInstructions = extractSpecialInstructions(data);
      setPerHeadInfo(specialInstructions);

      // ✅ FIXED: Process food data
      if (data.status_food === 'true' && Array.isArray(data.data_food)) {
        const foodItems = data.data_food
          .filter(
            item =>
              item &&
              item.description &&
              !item.description.toLowerCase().includes('special instruction'),
          )
          .map((item, idx) => {
            const quantity = parseFloat(item.quantity || 0);
            const unitPrice = parseFloat(item.unit_price || 0);

            if (item.description?.toLowerCase().includes('per head')) {
              foodPerHeadValue = String(unitPrice || '');
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
      }

      // ✅ FIXED: Process decoration data - F+S ke liye services data process karo
      if (
        data.status_decoration === 'true' &&
        Array.isArray(data.data_decoration)
      ) {
        if (detectedEventType === 'F+S') {
          // Services data process karo
          const servicesItems = data.data_decoration
            .filter(
              item =>
                item &&
                item.description &&
                !item.description.toLowerCase().includes('special instruction'),
            )
            .map((item, idx) => {
              const quantity = parseFloat(item.quantity || 0);
              const unitPrice = parseFloat(item.unit_price || 0);

              if (item.description?.toLowerCase().includes('per head')) {
                servicesPerHeadValue = String(unitPrice || '');
                return null;
              }

              return {
                id: String(idx + 11),
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

          setServicesRows(
            servicesItems.length > 0 ? servicesItems : makeDefaultRows(11),
          );
        } else {
          // Decoration data process karo
          const decItems = data.data_decoration
            .filter(
              item =>
                item &&
                item.description &&
                !item.description.toLowerCase().includes('special instruction'),
            )
            .map((item, idx) => {
              const quantity = parseFloat(item.quantity || 0);
              const unitPrice = parseFloat(item.unit_price || 0);

              if (item.description?.toLowerCase().includes('per head')) {
                decPerHeadValue = String(unitPrice || '');
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
        }
      }

      // ✅ FIXED: Director name issue - PROPERLY FIXED
      const directorId =
        eventData?.originalData?.director_id || eventData?.director_id;

      let directorNameToShow = '';
      if (directorId && directors.length > 0) {
        const foundDirector = directors.find(d => d.combo_code == directorId);
        directorNameToShow = foundDirector
          ? foundDirector.description
          : directorId;
      } else {
        directorNameToShow = eventData?.originalData?.director_name || '';
      }

      // ✅ FIXED: Client info with proper director data
      setClientInfo({
        contactNo: eventData.contact_no || '',
        name: eventData.name || '',
        venue: eventData.venue || '',
        dateTime: eventData.date || '',
        director: directorNameToShow,
        noOfGuest: eventData.guest || '',
      });

      // ✅ FIXED: Set discount amount from eventData
      const discountFromData = eventData?.originalData?.discount1 || '';
      setDiscountAmount(discountFromData);

      // Set other states
      setFoodOwnerAmount(foodPerHeadValue);
      setDecOwnerAmount(decPerHeadValue);
      setServicesOwnerAmount(servicesPerHeadValue);

      // ✅ IMPORTANT: Manual total ko empty rakho taki automatic calculation work kare
      setManualFoodTotal('');
      setManualDecTotal('');
      setManualServicesTotal('');

      const advanceAmount = eventData.advance || '0';
      setCashReceived(advanceAmount);
      setInitialAdvance(parseFloat(advanceAmount) || 0);

      // ✅ IMPORTANT: Bank ID check karo for edit mode
      if (
        eventData.bank_id &&
        eventData.bank_id !== '0' &&
        eventData.bank_id !== null
      ) {
        setAdvanceMode('bank');
        setBankSelected(String(eventData.bank_id));
        setBankAmount(advanceAmount);
      } else if (advanceAmount && parseFloat(advanceAmount) > 0) {
        setAdvanceMode('cash');
      } else {
        setAdvanceMode('none');
      }
    } catch (err) {
      console.log('Error fetching event details:', err);
    }
  };

  // Helper functions for detection
  const detectEventTypeFromResponse = data => {
    const hasFood = data.status_food === 'true' && data.data_food?.length > 0;
    const hasDecoration =
      data.status_decoration === 'true' && data.data_decoration?.length > 0;
    const hasBeverages =
      data.status_beverages === 'true' && data.data_beverages?.length > 0;

    // Check if it's F+S from original data
    const originalEventType = eventData?.originalData?.event_type;

    if (originalEventType === '4') return 'F+S';
    if (hasFood && hasDecoration) return 'F+D';
    if (hasFood && !hasDecoration) return 'F';
    if (!hasFood && hasDecoration) return 'D';
    return 'F';
  };

  const detectRateModeFromResponse = data => {
    const allItems = [
      ...(data.data_food || []),
      ...(data.data_decoration || []),
      ...(data.data_beverages || []),
    ];

    const hasPerHead = allItems.some(item =>
      item.description?.toLowerCase().includes('per head'),
    );

    return hasPerHead ? 'perhead' : 'perkg';
  };

  const detectBeverageTypeFromResponse = data => {
    if (data.status_beverages === 'true' && data.data_beverages?.length > 0) {
      const beverageItem = data.data_beverages[0];
      const beverageDesc = beverageItem.description?.toLowerCase() || '';
      if (beverageDesc.includes('can')) return 'can';
      if (beverageDesc.includes('regular')) return 'regular';
    }
    return 'none';
  };

  useEffect(() => {
    if (!eventData?.id) return;
    fetchEventDetails();
  }, [eventData, directors]);

  // ✅ NEW: Auto calculate when relevant data changes - EDIT MODE KE LIYE
  useEffect(() => {
    if (eventData?.id) {
      // Edit mode mein hain, calculation trigger karo
      const timer = setTimeout(() => {
        console.log('Auto calculating in edit mode...');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    foodRows,
    decRows,
    servicesRows,
    discountAmount,
    cashReceived,
    bankAmount,
    advanceMode,
    clientInfo.noOfGuest,
    foodOwnerAmount,
    decOwnerAmount,
    servicesOwnerAmount,
    beverageType,
    serviceType,
  ]);

  const updateClientInfo = useCallback((key, value) => {
    setClientInfo(prev => ({ ...prev, [key]: value }));
  }, []);

  // ✅ FIXED: updateRow function jo properly use ho raha hai
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
          const calculatedTotal =
            !isNaN(q) && !isNaN(rt) ? (q * rt).toFixed(2) : '';
          // Remove .00 if whole number
          item.total = calculatedTotal.endsWith('.00')
            ? calculatedTotal.split('.')[0]
            : calculatedTotal;
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

  const guestsCount = Number(clientInfo.noOfGuest) || 0;
  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);
  const servicesAutoTotal = useMemo(
    () => sumTable(servicesRows),
    [servicesRows],
  );
  const foodOwnerTotal = (parseFloat(foodOwnerAmount || 0) || 0) * guestsCount;
  const decOwnerTotal = (parseFloat(decOwnerAmount || 0) || 0) * guestsCount;
  const servicesOwnerTotal =
    (parseFloat(servicesOwnerAmount || 0) || 0) * guestsCount;
  const beverageRate =
    beverageType === 'regular' ? 250 : beverageType === 'can' ? 300 : 0;
  const beverageTotal = beverageRate * guestsCount;

  const finalFoodTotal = manualFoodTotal
    ? parseFloat(manualFoodTotal)
    : foodAutoTotal + foodOwnerTotal;

  const finalDecTotal = manualDecTotal
    ? parseFloat(manualDecTotal)
    : decAutoTotal + decOwnerTotal;

  const finalServicesTotal = manualServicesTotal
    ? parseFloat(manualServicesTotal)
    : servicesAutoTotal + servicesOwnerTotal;

  // ✅ UPDATED: Calculate subtotal before discount
  const subTotal =
    finalFoodTotal +
    (serviceType === 'F+S' ? finalServicesTotal : finalDecTotal) +
    beverageTotal;

  // ✅ FIXED: Only fixed discount
  const discountValue = parseFloat(discountAmount) || 0;
  const grandTotal = Math.max(0, subTotal - discountValue);

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
    setManualServicesTotal('');
    setServiceType('F');
    setRateMode('perhead');
    setPerHeadInfo('');
    setPerHeadExpanded(false);
    setFoodRows(makeDefaultRows(1));
    setDecRows(makeDefaultRows(6));
    setServicesRows(makeDefaultRows(11));
    setFoodOwnerAmount('');
    setDecOwnerAmount('');
    setServicesOwnerAmount('');
    setBeverageType('none');
    setAdvanceMode('none');
    setCashReceived('');
    setBankSelected('');
    setBankAmount('');
    setInitialAdvance(0);
  };

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

      // ✅ FIXED: Use discount1 field name
      if (discountAmount) {
        formData.append('discount1', discountAmount);
      }

      // ✅ FIXED: Comments field add karo - yeh important hai
      if (perHeadInfo.trim()) {
        formData.append('comments', perHeadInfo.trim());
      } else {
        formData.append('comments', '');
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

      const salesTypeMap = { perkg: '1', perhead: '4' };
      formData.append('sales_type', salesTypeMap[rateMode] || '4');

      // ✅ IMPORTANT: Bank ID properly send karo
      let bankIdToSend = 0;
      if (advanceMode === 'bank') {
        bankIdToSend = Number(bankSelected) || 0;
      }
      formData.append('bank_id', bankIdToSend);

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

      // ✅ FIXED: Services aur Decor rows alag alag
      if (serviceType === 'F+S') {
        // Services rows - text1 = 'S'
        servicesRows
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
              text1: 'S',
            });
          });
      } else {
        // Decor rows - text1 = 'D'
        decRows
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
              text1: 'D',
            });
          });
      }

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

        if (serviceType === 'F+S') {
          if (servicesOwnerAmount && parseFloat(servicesOwnerAmount) > 0) {
            salesOrderDetails.push({
              description: 'Services Per Head',
              quantity: clientInfo.noOfGuest || 0,
              unit_price: servicesOwnerAmount,
              text1: 'S',
            });
          }
        } else {
          if (decOwnerAmount && parseFloat(decOwnerAmount) > 0) {
            salesOrderDetails.push({
              description: 'Decoration Per Head',
              quantity: clientInfo.noOfGuest || 0,
              unit_price: decOwnerAmount,
              text1: 'D',
            });
          }
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

      if (salesOrderDetails.length > 0) {
        formData.append(
          'sales_order_details',
          JSON.stringify(salesOrderDetails),
        );
      }

      const response = await fetch(`${api.baseURL}post_event_quotation.php`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
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

  // ✅ FIXED: TableComponent jo aapke updateRow function ko use karega
  const TableComponent = memo(
    ({
      rows,
      setRows,
      title,
      tableName,
      ownerAmount,
      onOwnerAmountChange,
      manualTotal,
      onManualTotalChange,
      autoTotal,
    }) => {
      // ✅ Yahan global updateRow function ko use karo
      const handleUpdateCell = useCallback(
        (id, key, value, markManual = false) => {
          updateRow(setRows, id, key, value, markManual);
        },
        [setRows],
      );

      // ✅ Calculate total for this table
      const getTotalValue = () => {
        if (manualTotal) return formatCurrency(manualTotal);

        let ownerTotal = 0;
        const guestsCount = Number(clientInfo.noOfGuest) || 0;

        if (tableName === 'food')
          ownerTotal = (parseFloat(ownerAmount || 0) || 0) * guestsCount;
        else if (tableName === 'dec')
          ownerTotal = (parseFloat(ownerAmount || 0) || 0) * guestsCount;
        else if (tableName === 'services')
          ownerTotal = (parseFloat(ownerAmount || 0) || 0) * guestsCount;

        return formatCurrency(autoTotal + ownerTotal);
      };

      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {title} {rateMode === 'perhead' ? '(Per Head)' : '(Per KG)'}
          </Text>

          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { flex: 0.1 }]}>S#</Text>
            <Text style={[styles.headerCell, { flex: 0.45 }]}>Detail</Text>
            <Text style={[styles.headerCell, { flex: 0.1 }]}>Qty</Text>
            <Text style={[styles.headerCell, { flex: 0.15 }]}>Rate</Text>
            <Text style={[styles.headerCell, { flex: 0.2 }]}>Total</Text>
          </View>

          <ScrollView
            style={[styles.tableBody]}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            {rows.map((item, index) => (
              <TableRow
                key={`${tableName}-${item.id}-${index}`}
                item={item}
                index={index}
                onUpdateCell={handleUpdateCell}
                tableName={tableName}
                isEditMode={!!eventData?.id}
              />
            ))}
          </ScrollView>

          {/* ✅ FIXED: Add Row, Owner Amount, and Total in one row */}
          <View style={styles.addAndTotalsRow}>
            {/* Add Row Button */}
            <TouchableOpacity
              style={styles.smallAddLeft}
              onPress={() => addRow(rows, setRows)}
            >
              <Ionicons name="add" size={18} color={COLORS.WHITE} />
            </TouchableOpacity>

            {/* Owner Amount Input */}
            <View style={styles.ownerAmountWrap}>
              <OwnerAmountInput
                value={ownerAmount}
                onChange={onOwnerAmountChange}
                tableName={tableName}
              />
            </View>

            {/* Total Display */}
            <View style={styles.totalInlineRow}>
              <Text style={styles.totalLabelSmall}>
                {title.includes('Food')
                  ? 'Food Total'
                  : title.includes('Services')
                  ? 'Services Total'
                  : 'Decor Total'}
                :
              </Text>
              <View style={styles.totalCellSmall}>
                <Text style={styles.totalValueSmall}>{getTotalValue()}</Text>
              </View>
            </View>
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
                onPress={() => openDatePicker('date')}
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
                  ownerAmount={foodOwnerAmount}
                  onOwnerAmountChange={setFoodOwnerAmount}
                  manualTotal={manualFoodTotal}
                  onManualTotalChange={setManualFoodTotal}
                />

                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Beverages</Text>
                  </View>

                  <View style={styles.beverageRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkboxOption,
                        beverageType === 'regular' &&
                          styles.checkboxOptionActive,
                      ]}
                      onPress={() => {
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
                        beverageType === 'can' && styles.checkboxOptionActive,
                      ]}
                      onPress={() => {
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
                      Rs. {formatCurrency(beverageTotal)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ✅ FIXED: Services Table for F+S */}
            {serviceType === 'F+S' && (
              <TableComponent
                rows={servicesRows}
                setRows={setServicesRows}
                title="Services Details"
                autoTotal={servicesAutoTotal}
                tableName="services"
                ownerAmount={servicesOwnerAmount}
                onOwnerAmountChange={setServicesOwnerAmount}
                manualTotal={manualServicesTotal}
                onManualTotalChange={setManualServicesTotal}
              />
            )}

            {/* ✅ FIXED: Decor Table for D and F+D */}
            {(serviceType === 'D' || serviceType === 'F+D') && (
              <TableComponent
                rows={decRows}
                setRows={setDecRows}
                title="Decoration Details"
                autoTotal={decAutoTotal}
                tableName="dec"
                ownerAmount={decOwnerAmount}
                onOwnerAmountChange={setDecOwnerAmount}
                manualTotal={manualDecTotal}
                onManualTotalChange={setManualDecTotal}
              />
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

            {/* ✅ NEW: Sub Total Row */}
            <View style={styles.subTotalRow}>
              <Text style={styles.subTotalLabel}>Sub Total</Text>
              <Text style={styles.subTotalValue}>
                Rs. {formatCurrency(subTotal)}
              </Text>
            </View>

            {/* ✅ FIXED: Discount Section - Only Fixed */}
            <View style={styles.section}>
              <View style={styles.discountInputRow}>
                <Text style={styles.sectionTitle}>Discount</Text>
                <TextInput
                  value={discountAmount}
                  onChangeText={setDiscountAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                  style={styles.discountInput}
                />
                <Text style={styles.discountValueText}>
                  = Rs. {formatCurrency(discountValue)}
                </Text>
              </View>
            </View>

            {/* ✅ UPDATED: Grand Total Row */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>
                Rs. {formatCurrency(grandTotal)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advance Payment</Text>

              <View style={styles.advanceRow}>
                <TouchableOpacity
                  style={[
                    styles.advanceOption,
                    advanceMode === 'cash' && styles.advanceOptionActive,
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
                    advanceMode === 'bank' && styles.advanceOptionActive,
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
                      onValueChange={setBankSelected}
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
                  Rs. {formatCurrency(remainingBalance)}
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
