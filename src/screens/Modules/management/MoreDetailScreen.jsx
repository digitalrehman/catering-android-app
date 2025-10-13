import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PieChart from 'react-native-pie-chart';
import AppHeader from '../../../components/AppHeader';

const MoreDetailScreen = ({ route }) => {
  const { type } = route.params;
  const [data, setData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const colors = ['#FFD700', '#FF4C4C', '#00FF88', '#FF8800', '#4DB6AC'];

  useEffect(() => {
    // Mock data by type
    const sample = {
      bank: [
        { name: 'HBL Bank', amount: 60000 },
        { name: 'Meezan Bank', amount: 40000 },
        { name: 'Alfalah Bank', amount: 25000 },
      ],
      payable: [
        { name: 'Supplier A', amount: 15000 },
        { name: 'Supplier B', amount: 11000 },
        { name: 'Supplier C', amount: 9000 },
        { name: 'Supplier D', amount: 7000 },
      ],
      receivable: [
        { name: 'Client Alpha', amount: 13000 },
        { name: 'Client Beta', amount: 8000 },
        { name: 'Client Gamma', amount: 5000 },
      ],
      cash: [
        { name: 'Office Cash', amount: 55000 },
        { name: 'Event Cash', amount: 40000 },
        { name: 'Petty Cash', amount: 15000 },
      ],
    };

    const current = sample[type] || [];
    setData(current);
    setPieData(current.map((item, i) => ({
      value: item.amount,
      color: colors[i % colors.length],
    })));
  }, [type]);

  const title =
    type === 'bank'
      ? 'Bank Balance'
      : type === 'cash'
      ? 'Cash Balance'
      : type === 'receivable'
      ? 'Receivable Balance'
      : 'Payable Balance';

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <LinearGradient colors={['#4A0000', '#1A0000']} style={styles.container}>
      <AppHeader title={title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Pie Chart Section */}
        <View style={styles.chartContainer}>
          <PieChart
            widthAndHeight={220}
            series={pieData.map((p) => p.value)}
            sliceColor={pieData.map((p) => p.color)}
            coverRadius={0.6}
          />
          <View style={styles.centerLabel}>
            <Text style={styles.chartText}>{title}</Text>
          </View>
        </View>

        {/* Expense / Detail List */}
        <Text style={styles.listHeader}>
          Top {data.length} {title}
        </Text>
        <FlatList
          data={data}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item }) => {
            const perc = total ? ((item.amount / total) * 100).toFixed(1) : 0;
            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.amount}>
                    Rs. {item.amount.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.percent}>({perc}% of total)</Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

export default MoreDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 100,
  },
  listHeader: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    color: '#FFD700',
    fontWeight: '700',
  },
  percent: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
