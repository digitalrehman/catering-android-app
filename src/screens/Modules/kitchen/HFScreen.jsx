import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppHeader from '../../../components/AppHeader';
import COLORS from '../../../utils/colors';

const HFScreen = () => {
  const [showNote, setShowNote] = useState(false);
  const [specialNote, setSpecialNote] = useState('');
  const [rows, setRows] = useState([
    {
      id: 1,
      qty: '50',
      menu: 'Biryani',
      vendor: 'Food Express',
      cook: 'Chef Ali',
      department: 'Kitchen',
      status: 'Pending',
      call: '2',
      kitchen: false,
    },
    {
      id: 2,
      qty: '25',
      menu: 'Karahi',
      vendor: 'Spice House',
      cook: 'Chef Ahmed',
      department: 'Main Kitchen',
      status: 'In Progress',
      call: '1',
      kitchen: true,
    },
    {
      id: 3,
      qty: '30',
      menu: 'Tikka',
      vendor: 'BBQ Tonight',
      cook: 'Chef Sara',
      department: 'Grill Station',
      status: 'Completed',
      call: '0',
      kitchen: true,
    },
    {
      id: 4,
      qty: '15',
      menu: 'Pulao',
      vendor: 'Rice Delight',
      cook: 'Chef Rizwan',
      department: 'Rice Section',
      status: 'Pending',
      call: '3',
      kitchen: false,
    },
    {
      id: 5,
      qty: '20',
      menu: 'Nihari',
      vendor: 'Mughlai Taste',
      cook: 'Chef Nadeem',
      department: 'Curry Section',
      status: 'In Progress',
      call: '1',
      kitchen: true,
    },
  ]);

  const [editingCell, setEditingCell] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Screen open animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      qty: '',
      menu: '',
      vendor: '',
      cook: '',
      department: '',
      status: 'Pending',
      call: '0',
      kitchen: false,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleCellEdit = (rowIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex][field] = value;
    setRows(updated);
  };

  const handleCellFocus = (rowIndex, field) => {
    setEditingCell({ rowIndex, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const toggleKitchen = (rowIndex) => {
    const updated = [...rows];
    updated[rowIndex].kitchen = !updated[rowIndex].kitchen;
    setRows(updated);
  };

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth >= 768;
  const isMobile = screenWidth < 768;

  // Column configuration
  const getColumnConfig = () => {
    if (isTablet) {
      // Tablet - All 8 columns
      return [
        { key: 'qty', label: 'Qty', width: 60 },
        { key: 'menu', label: 'Menu', width: 120 },
        { key: 'vendor', label: 'Vender', width: 100 },
        { key: 'cook', label: 'Cook', width: 100 },
        { key: 'department', label: 'Department', width: 120 },
        { key: 'status', label: 'Status', width: 100 },
        { key: 'call', label: 'Call', width: 60 },
        { key: 'kitchen', label: 'Kitchen', width: 80 },
        { key: 'action', label: 'Action', width: 60 },
      ];
    } else {
      // Mobile - Qty, Menu, Cook, Department (4 columns)
      return [
        { key: 'qty', label: 'Qty', width: 50 },
        { key: 'menu', label: 'Menu', width: 100 },
        { key: 'cook', label: 'Cook', width: 80 },
        { key: 'department', label: 'Department', width: 100 },
        { key: 'action', label: 'Action', width: 50 },
      ];
    }
  };

  const columns = getColumnConfig();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Pending': return '#F44336';
      default: return '#666';
    }
  };

  const renderCellContent = (row, rowIndex, column) => {
    switch (column.key) {
      case 'qty':
      case 'menu':
      case 'vendor':
      case 'cook':
      case 'department':
      case 'call':
        return (
          <TextInput
            style={[
              styles.cellInput,
              editingCell?.rowIndex === rowIndex && editingCell?.field === column.key && styles.editingCell
            ]}
            value={row[column.key]}
            onChangeText={(text) => handleCellEdit(rowIndex, column.key, text)}
            onFocus={() => handleCellFocus(rowIndex, column.key)}
            onBlur={handleCellBlur}
            keyboardType={column.key === 'qty' || column.key === 'call' ? 'numeric' : 'default'}
          />
        );

      case 'status':
        return (
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: getStatusColor(row.status) }]}
            onPress={() => {
              const statuses = ['Pending', 'In Progress', 'Completed'];
              const currentIndex = statuses.indexOf(row.status);
              const nextIndex = (currentIndex + 1) % statuses.length;
              handleCellEdit(rowIndex, 'status', statuses[nextIndex]);
            }}
          >
            <Text style={styles.statusText}>{row.status}</Text>
          </TouchableOpacity>
        );

      case 'kitchen':
        return (
          <TouchableOpacity
            style={styles.kitchenCell}
            onPress={() => toggleKitchen(rowIndex)}
          >
            <Ionicons
              name={row.kitchen ? 'checkbox' : 'square-outline'}
              size={18}
              color={row.kitchen ? '#4CAF50' : '#666'}
            />
          </TouchableOpacity>
        );

      case 'action':
        return (
          <TouchableOpacity
            style={styles.actionCell}
            onPress={() => removeRow(rowIndex)}
          >
            <MaterialIcons name="delete" size={18} color="#F44336" />
          </TouchableOpacity>
        );

      default:
        return <Text style={styles.cellText}>{row[column.key]}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Kitchen Management" />

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContainer}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* ===== Top Info Section ===== */}
        <View style={styles.infoCard}>
          <View style={styles.inputRow}>
            <TextInput placeholder="Name" placeholderTextColor="#b0b0b0" style={styles.input} />
            <TextInput placeholder="Contact" placeholderTextColor="#b0b0b0" style={styles.input} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputRow}>
            <TextInput placeholder="Director" placeholderTextColor="#b0b0b0" style={styles.input} />
            <TextInput placeholder="Food Time" placeholderTextColor="#b0b0b0" style={styles.input} />
          </View>
          <View style={styles.inputRow}>
            <TextInput placeholder="Venue" placeholderTextColor="#b0b0b0" style={styles.input} />
            <TextInput placeholder="Guest" placeholderTextColor="#b0b0b0" style={styles.input} keyboardType="numeric" />
          </View>
          <View style={styles.inputRow}>
            <TextInput placeholder="Booking Manager" placeholderTextColor="#b0b0b0" style={styles.input} />
          </View>
        </View>

        {/* ===== Special Note ===== */}
        <View style={styles.noteContainer}>
          <TouchableOpacity
            style={styles.noteHeader}
            onPress={() => setShowNote(!showNote)}>
            <Text style={styles.noteTitle}>Special Note: Click to View...</Text>
            <Ionicons
              name={showNote ? 'eye-off' : 'eye'}
              size={18}
              color={COLORS.PRIMARY}
            />
          </TouchableOpacity>

          {showNote && (
            <TextInput
              style={styles.noteInput}
              placeholder="Enter details about food, spices, etc."
              multiline
              value={specialNote}
              onChangeText={setSpecialNote}
            />
          )}
        </View>

        {/* ===== Excel-like Table ===== */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {columns.map((column) => (
              <View key={column.key} style={[styles.headerCell, { width: column.width }]}>
                <Text style={styles.headerText}>{column.label}</Text>
              </View>
            ))}
          </View>

          {/* Table Body */}
          <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={true}>
            {rows.map((row, rowIndex) => (
              <View key={row.id} style={styles.tableRow}>
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[
                      styles.cell,
                      { width: column.width },
                      editingCell?.rowIndex === rowIndex && editingCell?.field === column.key && styles.activeCell
                    ]}
                  >
                    {renderCellContent(row, rowIndex, column)}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ===== Add Row Button ===== */}
        <TouchableOpacity style={styles.addBtn} onPress={addRow}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addText}>Add New Row</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

export default HFScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 60,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    marginHorizontal: 4,
    fontSize: 13,
    color: '#333',
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    fontSize: 13,
  },
  noteInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
  tableContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 35,
    alignItems: 'center',
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  cellInput: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    width: '100%',
    padding: 2,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  editingCell: {
    backgroundColor: '#e3f2fd',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  activeCell: {
    backgroundColor: '#f5f5f5',
  },
  cellText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 50,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  kitchenCell: {
    padding: 4,
  },
  actionCell: {
    padding: 4,
  },
  deviceInfo: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  deviceText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});