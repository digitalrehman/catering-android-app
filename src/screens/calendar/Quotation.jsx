import React, { useMemo, useState } from 'react';
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
import COLORS from '../../utils/colors'; // <- adjust path to your COLORS file

const DEFAULT_ROWS = 10;

const makeDefaultRows = (startId = 1) =>
  Array.from({ length: DEFAULT_ROWS }).map((_, i) => ({
    id: String(startId + i),
    menu: '',
    qty: '',
    rate: '',
    total: '',
    manualTotal: false, // if user types total manually
  }));

const Quotation = ({ navigation }) => {
  // top cells (no visible labels — placeholders only as requested)
  const [cellValues, setCellValues] = useState({
    businessName: '',
    contactNo: '',
    contactName: '',
    venue: '',
    dateTime: '',
    director: '',
    guests: '',
  });

  // service radios
  const [service, setService] = useState('F'); // F, D, F + D, F + S
  const [rateMode, setRateMode] = useState('perhead'); // perhead | perkg

  // tables: food & decoration
  const [foodRows, setFoodRows] = useState(makeDefaultRows(1));
  const [decRows, setDecRows] = useState(makeDefaultRows(DEFAULT_ROWS + 1));

  // visibility toggles (per request: per-head default shows; also provide toggle)
  const [foodVisible, setFoodVisible] = useState(true);
  const [decVisible, setDecVisible] = useState(true);

  // per-head info area (text)
  const [perHeadInfo, setPerHeadInfo] = useState('');

  // editable grand totals (they are computed but owner can edit)
  const [foodTotalOverride, setFoodTotalOverride] = useState('');
  const [decTotalOverride, setDecTotalOverride] = useState('');
  const [grandTotalOverride, setGrandTotalOverride] = useState('');

  // helper: update top cell
  const updateCell = (key, value) =>
    setCellValues(prev => ({ ...prev, [key]: value }));

  // table helpers
  const updateRow = (rows, setRows, id, key, value) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const next = { ...r, [key]: value };
        // if qty or rate changed and not manualTotal => recalc total
        if (!next.manualTotal && (key === 'qty' || key === 'rate')) {
          const q = parseFloat(next.qty || 0);
          const rt = parseFloat(next.rate || 0);
          if (!isNaN(q) && !isNaN(rt)) next.total = (q * rt).toString();
          else next.total = '';
        }
        return next;
      }),
    );
  };

  // when user edits total manually -> set manualTotal flag
  const setManualTotal = (setRows, id, value) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, total: value, manualTotal: true } : r,
      ),
    );
  };

  // add row
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

  // compute sum of totals for a table (if override provided, use that)
  const sumTable = rows =>
    rows.reduce((acc, r) => acc + (parseFloat(r.total || 0) || 0), 0);

  const foodAutoTotal = useMemo(() => sumTable(foodRows), [foodRows]);
  const decAutoTotal = useMemo(() => sumTable(decRows), [decRows]);

  const foodTotal =
    foodTotalOverride !== ''
      ? parseFloat(foodTotalOverride || 0)
      : foodAutoTotal;
  const decTotal =
    decTotalOverride !== '' ? parseFloat(decTotalOverride || 0) : decAutoTotal;

  const grandAuto = foodAutoTotal + decAutoTotal;
  const grandTotal =
    grandTotalOverride !== '' ? parseFloat(grandTotalOverride || 0) : grandAuto;

  // convenience render row
  const Row = ({ row, rowsState, setRowsState, allowEditTotal = true }) => {
    return (
      <View style={styles.tableRow}>
        <TextInput
          style={[styles.cell, styles.menuCell]}
          placeholder="Menu"
          placeholderTextColor="#666"
          value={row.menu}
          onChangeText={t =>
            updateRow(rowsState, setRowsState, row.id, 'menu', t)
          }
        />
        <TextInput
          style={[styles.cell, styles.smallCell]}
          placeholder="Qty"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={String(row.qty)}
          onChangeText={t =>
            updateRow(rowsState, setRowsState, row.id, 'qty', t)
          }
        />
        <TextInput
          style={[styles.cell, styles.smallCell]}
          placeholder="Rate"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={String(row.rate)}
          onChangeText={t =>
            updateRow(rowsState, setRowsState, row.id, 'rate', t)
          }
        />
        {allowEditTotal ? (
          <TextInput
            style={[styles.cell, styles.smallCell]}
            placeholder="Total"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={String(row.total)}
            onChangeText={t => setManualTotal(setRowsState, row.id, t)}
          />
        ) : (
          <TextInput
            style={[
              styles.cell,
              styles.smallCell,
              { backgroundColor: '#f0f0f0' },
            ]}
            editable={false}
            value={String(row.total)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quotation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Top cells - shown like table cells with placeholders (no labels) */}
        <View style={styles.topGrid}>
          <TextInput
            style={styles.topCell}
            placeholder="Business Name"
            placeholderTextColor="#999"
            value={cellValues.businessName}
            onChangeText={t => updateCell('businessName', t)}
          />
          <TextInput
            style={styles.topCell}
            placeholder="Contact No."
            placeholderTextColor="#999"
            value={cellValues.contactNo}
            keyboardType="phone-pad"
            onChangeText={t => updateCell('contactNo', t)}
          />
          <TextInput
            style={styles.topCell}
            placeholder="Contact Person"
            placeholderTextColor="#999"
            value={cellValues.contactName}
            onChangeText={t => updateCell('contactName', t)}
          />
        </View>

        <View style={styles.topGrid}>
          <TextInput
            style={styles.topCell}
            placeholder="Venue"
            placeholderTextColor="#999"
            value={cellValues.venue}
            onChangeText={t => updateCell('venue', t)}
          />
          <TextInput
            style={styles.topCell}
            placeholder="Date & Time"
            placeholderTextColor="#999"
            value={cellValues.dateTime}
            onChangeText={t => updateCell('dateTime', t)}
          />
          <TextInput
            style={styles.topCell}
            placeholder="Director"
            placeholderTextColor="#999"
            value={cellValues.director}
            onChangeText={t => updateCell('director', t)}
          />
        </View>

        {/* Guests + Per Head/Per Kg in one row */}
        <View style={[styles.topGrid, { alignItems: 'center' }]}>
          <TextInput
            style={[styles.topCell, { flex: 0.3 }]} // 30%
            placeholder="No of Guests"
            placeholderTextColor="#999"
            value={cellValues.guests}
            keyboardType="numeric"
            onChangeText={t => updateCell('guests', t)}
          />

          <View
            style={[
              //   styles.topCell,
              {
                flex: 0.7, // 70%
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              },
            ]}
          >
            {['perhead', 'perkg'].map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setRateMode(mode)}
                style={[
                  styles.smallOption,
                  { flex: 1, marginHorizontal: 4 }, // equal width buttons
                  rateMode === mode ? styles.smallOptionActive : null,
                ]}
              >
                <Text
                  style={
                    rateMode === mode
                      ? styles.smallOptionTextActive
                      : styles.smallOptionText
                  }
                >
                  {mode === 'perhead' ? 'Per Head' : 'Per KG'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.topGrid,
            { justifyContent: 'space-between', alignItems: 'center' },
          ]}
        >
          {['F', 'D', 'F + D', 'F + S'].map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setService(s)}
              style={[
                styles.serviceBtn,
                { flex: 1, marginHorizontal: 4 }, // equal width fill row
                service === s ? styles.serviceBtnActive : null,
              ]}
            >
              <Text
                style={[
                  styles.serviceBtnText,
                  service === s
                    ? { color: COLORS.PRIMARY_DARK }
                    : { color: COLORS.WHITE },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ----- PER KG / PER HEAD Heading area (small note) ----- */}
        <View style={styles.modeNote}>
          <Text style={styles.modeNoteText}>
            {rateMode === 'perhead' ? 'Per Head' : 'Per KG'}
          </Text>
        </View>

        {/* ----- FOOD DETAILS ----- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Details</Text>

            <View style={styles.sectionActions}>
              <TouchableOpacity
                onPress={() => setFoodVisible(v => !v)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconBtnText}>
                  {foodVisible ? 'Hide' : 'View'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addRow(foodRows, setFoodRows)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconBtnText}>+ Row</Text>
              </TouchableOpacity>
            </View>
          </View>

          {foodVisible ? (
            <>
              {/* header row */}
              <View
                style={[
                  styles.tableHeader,
                  rateMode === 'perhead' ? styles.perHeadHighlight : null,
                ]}
              >
                <Text style={[styles.headerCell, { flex: 0.1 }]}>S#</Text>
                <Text style={[styles.headerCell, { flex: 0.5 }]}>Menu</Text>
                <Text style={[styles.headerCell, { flex: 0.13 }]}>Qty</Text>
                <Text style={[styles.headerCell, { flex: 0.13 }]}>Rate</Text>
                <Text style={[styles.headerCell, { flex: 0.14 }]}>Total</Text>
              </View>

              <FlatList
                data={foodRows}
                keyExtractor={r => r.id}
                renderItem={({ item, index }) => (
                  <View style={styles.tableRow}>
                    <View style={[styles.snoCell]}>
                      <Text style={styles.snoText}>{index + 1}</Text>
                    </View>

                    <TextInput
                      style={[styles.cell, { flex: 0.5 }]}
                      placeholder="Menu item..."
                      placeholderTextColor="#666"
                      value={item.menu}
                      onChangeText={t =>
                        updateRow(foodRows, setFoodRows, item.id, 'menu', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.13 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.qty)}
                      onChangeText={t =>
                        updateRow(foodRows, setFoodRows, item.id, 'qty', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.13 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.rate)}
                      onChangeText={t =>
                        updateRow(foodRows, setFoodRows, item.id, 'rate', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.14 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.total)}
                      onChangeText={t =>
                        setManualTotal(setFoodRows, item.id, t)
                      }
                    />
                  </View>
                )}
              />

              {/* food total and override */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Food Total</Text>
                <TextInput
                  style={styles.totalInput}
                  keyboardType="numeric"
                  value={
                    foodTotalOverride !== ''
                      ? String(foodTotalOverride)
                      : String(foodAutoTotal)
                  }
                  onChangeText={setFoodTotalOverride}
                />
              </View>
            </>
          ) : (
            <View style={styles.hiddenNote}>
              <Text style={styles.hiddenNoteText}>Food details are hidden</Text>
            </View>
          )}
        </View>

        {/* ----- DECORATION DETAILS ----- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Decoration Details</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity
                onPress={() => setDecVisible(v => !v)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconBtnText}>
                  {decVisible ? 'Hide' : 'View'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addRow(decRows, setDecRows)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconBtnText}>+ Row</Text>
              </TouchableOpacity>
            </View>
          </View>

          {decVisible ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 0.1 }]}>S#</Text>
                <Text style={[styles.headerCell, { flex: 0.5 }]}>Menu</Text>
                <Text style={[styles.headerCell, { flex: 0.13 }]}>Qty</Text>
                <Text style={[styles.headerCell, { flex: 0.13 }]}>Rate</Text>
                <Text style={[styles.headerCell, { flex: 0.14 }]}>Total</Text>
              </View>

              <FlatList
                data={decRows}
                keyExtractor={r => r.id}
                renderItem={({ item, index }) => (
                  <View style={styles.tableRow}>
                    <View style={[styles.snoCell]}>
                      <Text style={styles.snoText}>{index + 1}</Text>
                    </View>

                    <TextInput
                      style={[styles.cell, { flex: 0.5 }]}
                      placeholder="Decoration item..."
                      placeholderTextColor="#666"
                      value={item.menu}
                      onChangeText={t =>
                        updateRow(decRows, setDecRows, item.id, 'menu', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.13 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.qty)}
                      onChangeText={t =>
                        updateRow(decRows, setDecRows, item.id, 'qty', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.13 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.rate)}
                      onChangeText={t =>
                        updateRow(decRows, setDecRows, item.id, 'rate', t)
                      }
                    />

                    <TextInput
                      style={[styles.cell, { flex: 0.14 }]}
                      placeholder="0"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={String(item.total)}
                      onChangeText={t => setManualTotal(setDecRows, item.id, t)}
                    />
                  </View>
                )}
              />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Decor Total</Text>
                <TextInput
                  style={styles.totalInput}
                  keyboardType="numeric"
                  value={
                    decTotalOverride !== ''
                      ? String(decTotalOverride)
                      : String(decAutoTotal)
                  }
                  onChangeText={setDecTotalOverride}
                />
              </View>
            </>
          ) : (
            <View style={styles.hiddenNote}>
              <Text style={styles.hiddenNoteText}>
                Decoration details are hidden
              </Text>
            </View>
          )}
        </View>

        {/* per-head info textarea (visible for perhead mode) */}
        {rateMode === 'perhead' && (
          <View style={styles.perHeadArea}>
            <TextInput
              style={styles.perHeadInput}
              placeholder="Per-head additional info..."
              placeholderTextColor="#666"
              multiline
              value={perHeadInfo}
              onChangeText={setPerHeadInfo}
            />
          </View>
        )}

        {/* GRAND TOTAL */}
        <View
          style={[styles.grandRow, { backgroundColor: COLORS.PRIMARY_DARK }]}
        >
          <Text style={styles.grandLabel}>Grand Total</Text>
          <TextInput
            style={styles.grandInput}
            keyboardType="numeric"
            value={
              grandTotalOverride !== ''
                ? String(grandTotalOverride)
                : String(grandAuto)
            }
            onChangeText={setGrandTotalOverride}
          />
        </View>

        {/* small action row */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.ACCENT }]}
            onPress={() => {
              // quick validation or show JSON
              const payload = {
                header: cellValues,
                service,
                rateMode,
                foodRows,
                decRows,
                totals: { foodTotal, decTotal, grandTotal },
              };
              Alert.alert(
                'Quotation JSON',
                JSON.stringify(payload, null, 2).slice(0, 500) + ' ...',
              );
            }}
          >
            <Text style={{ color: COLORS.BLACK, fontWeight: '700' }}>
              Preview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() =>
              Alert.alert('Save', 'Implement save/post logic here')
            }
          >
            <Text style={{ color: COLORS.WHITE, fontWeight: '700' }}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default Quotation;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.GRADIENT_PRIMARY[0] },
  header: {
    height: 64,
    backgroundColor: COLORS.PRIMARY_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
  container: {
    padding: 12,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

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
    borderColor: 'rgba(0,0,0,0.06)',
    color: COLORS.BLACK,
  },

  serviceCell: { justifyContent: 'center' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceBtn: {
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  serviceBtnActive: {
    backgroundColor: COLORS.ACCENT,
  },
  serviceBtnText: { color: COLORS.WHITE },

  smallOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  smallOptionActive: { backgroundColor: COLORS.ACCENT },
  smallOptionText: { color: COLORS.WHITE },
  smallOptionTextActive: { color: COLORS.PRIMARY_DARK },

  modeNote: { marginVertical: 6, alignItems: 'flex-end' },
  modeNoteText: { color: COLORS.PRIMARY_DARK, fontWeight: '700' },

  section: {
    marginTop: 6,
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontWeight: '700', color: COLORS.PRIMARY_DARK },
  sectionActions: { flexDirection: 'row' },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  iconBtnText: { color: COLORS.WHITE, fontWeight: '700' },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerCell: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 6,
  },

  tableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  snoCell: { flex: 0.1, alignItems: 'center' },
  snoText: { color: '#333' },
  cell: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  menuCell: { minHeight: 40, textAlignVertical: 'top' },

  perHeadHighlight: { backgroundColor: COLORS.ACCENT },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: { fontWeight: '700', color: COLORS.PRIMARY_DARK },
  totalInput: {
    width: 120,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    color: COLORS.BLACK,
  },

  hiddenNote: { padding: 12, alignItems: 'center' },
  hiddenNoteText: { color: '#777' },

  perHeadArea: { marginTop: 10 },
  perHeadInput: {
    minHeight: 80,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
  },

  grandRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandLabel: { color: COLORS.WHITE, fontWeight: '800', fontSize: 16 },
  grandInput: {
    width: 140,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    color: COLORS.BLACK,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  serviceBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_DARK,
    backgroundColor: COLORS.PRIMARY,
  },
  serviceBtnActive: { backgroundColor: COLORS.ACCENT },
  serviceBtnText: { fontWeight: '600', color: COLORS.WHITE },

  smallOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_DARK,
    backgroundColor: COLORS.PRIMARY,
  },
  smallOptionActive: { backgroundColor: COLORS.ACCENT },
  smallOptionText: { color: COLORS.WHITE },
  smallOptionTextActive: { color: COLORS.PRIMARY_DARK, fontWeight: '700' },
});
