import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../../components/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../../../utils/colors';

const MoreDetailScreen = ({ route, navigation }) => {
  const { type, title, amount, prev } = route.params;
  const [data, setData] = useState([]);

  const colors = [
    COLORS.ACCENT,
    COLORS.ERROR,
    COLORS.INFO,
    COLORS.WARNING,
    COLORS.BLUE_MEDIUM,
    COLORS.BLUE_DARK,
    COLORS.SUCCESS,
  ];

  useEffect(() => {
    const sampleData = {
      cash: [
        { name: 'Office Cash', amount: 55000 },
        { name: 'Event Cash', amount: 40000 },
        { name: 'Petty Cash', amount: 15000 },
        { name: 'Emergency Fund', amount: 12000 },
      ],
      bank: [
        { name: 'HBL Bank', amount: 60000 },
        { name: 'Meezan Bank', amount: 40000 },
        { name: 'Alfalah Bank', amount: 25000 },
        { name: 'UBL Bank', amount: 18000 },
      ],
      receivable: [
        { name: 'Client Alpha', amount: 13000 },
        { name: 'Client Beta', amount: 8000 },
        { name: 'Client Gamma', amount: 5000 },
        { name: 'Client Delta', amount: 4000 },
      ],
      payable: [
        { name: 'Supplier A', amount: 15000 },
        { name: 'Supplier B', amount: 11000 },
        { name: 'Supplier C', amount: 9000 },
        { name: 'Supplier D', amount: 7000 },
      ],
    };
    setData(sampleData[type] || []);
  }, [type]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const isUp = amount >= prev;
  const difference = amount - prev;
  const percentageChange =
    prev !== 0 ? ((difference / prev) * 100).toFixed(1) : 0;

  const SimpleBarChart = ({ data }) => {
    const maxAmount = Math.max(...data.map(item => item.amount));
    return (
      <View style={styles.barChartContainer}>
        <Text style={styles.chartTitle}>Distribution Chart</Text>
        {data.map((item, index) => {
          const percentage =
            maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const totalPercentage =
            total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
          const color = colors[index % colors.length];
          return (
            <View key={index} style={styles.barChartItem}>
              <View style={styles.barChartHeader}>
                <View style={styles.barChartLabel}>
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                  <Text style={styles.barChartName}>{item.name}</Text>
                </View>
                <Text style={styles.barChartPercent}>{totalPercentage}%</Text>
              </View>
              <View style={styles.barChartBar}>
                <View
                  style={[
                    styles.barChartFill,
                    { width: `${percentage}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <View style={styles.barChartFooter}>
                <Text style={styles.barChartAmount}>
                  Rs. {item.amount.toLocaleString()}
                </Text>
                <Text style={styles.barChartPercentage}>
                  {totalPercentage}% of total
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient colors={COLORS.GRADIENT_PRIMARY} style={styles.container}>
      <AppHeader title={title} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={COLORS.GRADIENT_ACCENT}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Current Balance</Text>
            <Icon
              name={isUp ? 'arrow-up-bold' : 'arrow-down-bold'}
              color={isUp ? COLORS.SUCCESS : COLORS.ERROR}
              size={20}
            />
          </View>
          <Text style={styles.currentAmount}>
            Rs. {amount.toLocaleString()}
          </Text>
          <View style={styles.comparisonRow}>
            <Text style={styles.prevText}>
              Previous: Rs. {prev.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.changeText,
                { color: isUp ? COLORS.SUCCESS : COLORS.ERROR },
              ]}
            >
              {isUp ? '+' : ''}
              {difference.toLocaleString()} ({isUp ? '+' : ''}
              {percentageChange}%)
            </Text>
          </View>
        </LinearGradient>

        {data.length > 0 && (
          <View style={styles.chartSection}>
            <SimpleBarChart data={data} />
          </View>
        )}

        {data.length > 0 ? (
          <>
            <Text style={styles.listHeader}>Detailed Breakdown</Text>
            <FlatList
              data={data}
              keyExtractor={(item, i) => i.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const perc = total
                  ? ((item.amount / total) * 100).toFixed(1)
                  : 0;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.nameContainer}>
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: colors[index % colors.length] },
                          ]}
                        />
                        <Text style={styles.name}>{item.name}</Text>
                      </View>
                      <Text style={styles.amount}>
                        Rs. {item.amount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.percentageBar}>
                      <View
                        style={[
                          styles.percentageFill,
                          {
                            width: `${perc}%`,
                            backgroundColor: colors[index % colors.length],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.percent}>({perc}% of total)</Text>
                  </View>
                );
              }}
            />
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="chart-line" size={50} color={COLORS.ACCENT} />
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_DARK,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  currentAmount: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevText: {
    color: COLORS.GRAY,
    fontSize: 14,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartSection: { marginBottom: 20 },
  chartTitle: {
    color: COLORS.ACCENT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  barChartContainer: {
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  barChartItem: { marginBottom: 20 },
  barChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barChartLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  barChartName: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  barChartPercent: { color: COLORS.ACCENT, fontSize: 14, fontWeight: '700' },
  barChartBar: {
    height: 10,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  barChartFill: { height: '100%', borderRadius: 5 },
  barChartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barChartAmount: { color: COLORS.ACCENT, fontSize: 12, fontWeight: '600' },
  barChartPercentage: { color: COLORS.GRAY, fontSize: 12 },
  listHeader: {
    fontSize: 18,
    color: COLORS.ACCENT,
    fontWeight: '700',
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { color: COLORS.WHITE, fontSize: 16, fontWeight: '600', flex: 1 },
  amount: { color: COLORS.ACCENT, fontWeight: '700', fontSize: 16 },
  percentageBar: {
    height: 6,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  percentageFill: { height: '100%', borderRadius: 3 },
  percent: { color: COLORS.GRAY, fontSize: 12, textAlign: 'right' },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: { color: COLORS.ACCENT, fontSize: 16, marginTop: 10 },
});

export default MoreDetailScreen;
