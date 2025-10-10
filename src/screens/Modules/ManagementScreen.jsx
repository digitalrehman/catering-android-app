import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../../utils/colors';

const ManagementScreen = () => {
  const [loader, setLoader] = useState(true);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [revData, setRevData] = useState([]);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setIncomeData([
        { id: 1, title: 'Total Income', amount: 280000 },
        { id: 2, title: 'Event Booking Income', amount: 180000 },
      ]);
      setExpenseData([
        { id: 1, title: 'Kitchen Expense', amount: 85000 },
        { id: 2, title: 'Staff Salary', amount: 45000 },
        { id: 3, title: 'Event Material', amount: 20000 },
      ]);
      setRevData([
        {
          id: 1,
          title: 'Cash',
          amount: 95000,
          prev: 88000,
        },
        {
          id: 2,
          title: 'Bank',
          amount: 125000,
          prev: 110000,
        },
        {
          id: 3,
          title: 'Receivable',
          amount: 34000,
          prev: 27000,
        },
        {
          id: 4,
          title: 'Payable',
          amount: 26000,
          prev: 31000,
        },
      ]);
      setLoader(false);
    }, 1000);
  }, []);

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
      <Text style={styles.rowAmount}>Rs. {item.amount.toLocaleString()}</Text>
    </View>
  );

  const renderRevenue = ({ item }) => {
    const isUp = item.amount >= item.prev;
    return (
      <LinearGradient
        colors={['#B83232', '#4A0000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.revenueCard}
      >
        <View style={styles.revHeader}>
          <Text style={styles.revTitle}>{item.title}</Text>
          <Icon
            name={isUp ? 'arrow-up-bold' : 'arrow-down-bold'}
            color={isUp ? '#00FF88' : '#FF4C4C'}
            size={18}
          />
        </View>
        <Text style={styles.revAmount}>Rs. {item.amount.toLocaleString()}</Text>
        <Text style={styles.prevAmount}>
          Prev: Rs. {item.prev.toLocaleString()}
        </Text>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={['#4A0000', '#1A0000']} style={styles.container}>
      <AppHeader title="Management" />

      {loader ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Income Section */}
          <View style={styles.box}>
            <Text style={styles.boxHeader}>Income</Text>
            <FlatList
              data={incomeData}
              keyExtractor={item => item.id.toString()}
              renderItem={renderRow}
            />
          </View>

          {/* Expense Section */}
          <View style={styles.box}>
            <Text style={styles.boxHeader}>Expense</Text>
            <FlatList
              data={expenseData}
              keyExtractor={item => item.id.toString()}
              renderItem={renderRow}
            />
          </View>

          {/* Revenue Section */}
          <Text style={styles.sectionHeader}>Revenue Overview</Text>
          <FlatList
            data={revData}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingBottom: 20,
            }}
            renderItem={renderRevenue}
          />
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default ManagementScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  boxHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#FFD700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rowTitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD700',
  },
  sectionHeader: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  revenueCard: {
    width: '47%',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revTitle: { color: '#FFD700', fontSize: 14, fontWeight: '700' },
  revAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  prevAmount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
