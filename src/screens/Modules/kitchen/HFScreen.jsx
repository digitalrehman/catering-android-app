import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
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
      qty: '',
      menu: '',
      vendor: '',
      cook: '',
      department: '',
      status: '',
      call: '',
      kitchen: false,
    },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        qty: '',
        menu: '',
        vendor: '',
        cook: '',
        department: '',
        status: '',
        call: '',
        kitchen: false,
      },
    ]);
  };

  const removeRow = index => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleChange = (value, index, field) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 420;

  return (
    <View style={styles.container}>
      <AppHeader title="Kitchen Management" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ===== Top Info Section ===== */}
        <View style={styles.infoCard}>
          <View style={styles.inputRow}>
            <TextInput placeholder="Name"   placeholderTextColor="#b0b0b0" style={styles.input} />
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
              size={20}
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

        {/* ===== Editable Table ===== */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 750 }}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 0.5 }]}>Qty</Text>
                <Text style={[styles.headerCell, { flex: 1.2 }]}>Menu</Text>
                {!isMobile && <Text style={[styles.headerCell, { flex: 1 }]}>Vendor</Text>}
                {!isMobile && <Text style={[styles.headerCell, { flex: 1 }]}>Cook</Text>}
                {!isMobile && <Text style={[styles.headerCell, { flex: 1 }]}>Department</Text>}
                <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
                {!isMobile && <Text style={[styles.headerCell, { flex: 0.7 }]}>Call</Text>}
                <Text style={[styles.headerCell, { flex: 0.8 }]}>Kitchen+</Text>
                <Text style={[styles.headerCell, { flex: 0.5 }]}>Add</Text>
              </View>

              {/* Rows */}
              {rows.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <TextInput
                    style={[styles.cell, { flex: 0.5 }]}
                    value={row.qty}
                    onChangeText={t => handleChange(t, index, 'qty')}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.cell, { flex: 1.2 }]}
                    value={row.menu}
                    onChangeText={t => handleChange(t, index, 'menu')}
                  />
                  {!isMobile && (
                    <TextInput
                      style={[styles.cell, { flex: 1 }]}
                      value={row.vendor}
                      onChangeText={t => handleChange(t, index, 'vendor')}
                    />
                  )}
                  {!isMobile && (
                    <TextInput
                      style={[styles.cell, { flex: 1 }]}
                      value={row.cook}
                      onChangeText={t => handleChange(t, index, 'cook')}
                    />
                  )}
                  {!isMobile && (
                    <TextInput
                      style={[styles.cell, { flex: 1 }]}
                      value={row.department}
                      onChangeText={t => handleChange(t, index, 'department')}
                    />
                  )}
                  <TextInput
                    style={[styles.cell, { flex: 1 }]}
                    value={row.status}
                    onChangeText={t => handleChange(t, index, 'status')}
                  />
                  {!isMobile && (
                    <TextInput
                      style={[styles.cell, { flex: 0.7 }]}
                      value={row.call}
                      onChangeText={t => handleChange(t, index, 'call')}
                    />
                  )}
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: '#eee', flex: 0.8 }]}
                    onPress={() =>
                      handleChange(!row.kitchen, index, 'kitchen')
                    }>
                    <Ionicons
                      name={row.kitchen ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={COLORS.PRIMARY}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: COLORS.PRIMARY, flex: 0.5 }]}
                    onPress={() => removeRow(index)}>
                    <MaterialIcons name="delete" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ===== Add Row ===== */}
        <TouchableOpacity style={styles.addBtn} onPress={addRow}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addText}>Add Row</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 14,
    paddingBottom: 60,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
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
    paddingVertical: 6,
    marginHorizontal: 4,
    fontSize: 14,
    color: COLORS.DARK,
  },
  noteContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },
  noteInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 13,
    color: COLORS.DARK,
  },
  tableCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    borderRightWidth: 1,
    borderColor: '#eee',
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 6,
    color: COLORS.DARK,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  addText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
