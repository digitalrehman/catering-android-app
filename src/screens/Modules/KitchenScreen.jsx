import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../../utils/colors'; // apke theme colors
import AppHeader from '../../components/AppHeader';

const KitchenScreen = () => {
  const [rows, setRows] = useState([
    { item: '', orderQty: '', estimatePrice: '' },
  ]);

  const addRow = () => {
    setRows([...rows, { item: '', orderQty: '', estimatePrice: '' }]);
  };

  const removeRow = index => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleChange = (text, index, field) => {
    const newRows = [...rows];
    newRows[index][field] = text;
    setRows(newRows);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader title="Kitchen Management" />

      {/* Scroll Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client Name</Text>
            <TextInput
              placeholder="Enter client name"
              style={styles.input}
              placeholderTextColor={COLORS.GRAY}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              placeholder="Enter contact number"
              style={styles.input}
              placeholderTextColor={COLORS.GRAY}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 0.6 }]}>Item</Text>
            <Text style={[styles.headerText, { flex: 0.2 }]}>Order Qty</Text>
            <Text style={[styles.headerText, { flex: 0.2 }]}>Estimate</Text>
          </View>

          {rows.map((row, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                placeholder="Item name"
                value={row.item}
                onChangeText={text => handleChange(text, index, 'item')}
                style={[styles.cell, { flex: 0.6 }]}
                placeholderTextColor={COLORS.GRAY_LIGHT}
              />
              <TextInput
                placeholder="Qty"
                value={row.orderQty}
                onChangeText={text => handleChange(text, index, 'orderQty')}
                style={[styles.cell, { flex: 0.2 }]}
                placeholderTextColor={COLORS.GRAY_LIGHT}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Price"
                value={row.estimatePrice}
                onChangeText={text =>
                  handleChange(text, index, 'estimatePrice')
                }
                style={[styles.cell, { flex: 0.2 }]}
                placeholderTextColor={COLORS.GRAY_LIGHT}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => removeRow(index)}
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={addRow}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Row</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default KitchenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 3,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.DARK,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: COLORS.TEXT,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.ACCENT,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    fontSize: 13,
    backgroundColor: '#fdfdfd',
    color: COLORS.TEXT,
  },
  deleteBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 6,
    borderRadius: 8,
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    elevation: 3,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
