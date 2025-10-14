import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ScrollView,
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../../components/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const MoreDetailScreen = ({ route, navigation }) => {
  const { type, title, amount, prev } = route.params;
  const [data, setData] = useState([]);

  const colors = [
    '#FFD700', // Golden
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFA726', // Orange
    '#42A5F5', // Blue
    '#AB47BC', // Purple
    '#66BB6A', // Green
  ];

  useEffect(() => {
    // Dynamic data based on type
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

    const current = sampleData[type] || [];
    setData(current);
  }, [type]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const isUp = amount >= prev;
  const difference = amount - prev;
  const percentageChange = prev !== 0 ? ((difference / prev) * 100).toFixed(1) : 0;

  // Simple Circular Progress Chart
  const CircularProgressChart = ({ data }) => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.circularChart}>
          {/* Background Circle */}
          <View style={styles.circleBackground} />
          
          {/* Progress Segments */}
          <View style={styles.circleContainer}>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.amount / total) : 0;
              const segmentAngle = percentage * 360;
              const color = colors[index % colors.length];
              
              if (segmentAngle === 0) return null;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.circleSegment,
                    {
                      borderColor: color,
                      borderWidth: 15,
                      transform: [
                        { rotate: `${data.slice(0, index).reduce((sum, _, i) => sum + (data[i].amount / total) * 360, 0)}deg` }
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
          
          {/* Center Content */}
          <View style={styles.circleCenter}>
            <Icon name="chart-donut" size={30} color="#FFD700" />
            <Text style={styles.circleCenterText}>{title}</Text>
            <Text style={styles.circleCenterAmount}>Rs. {total.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Simple Bar Chart
  const SimpleBarChart = ({ data }) => {
    const maxAmount = Math.max(...data.map(item => item.amount));
    
    return (
      <View style={styles.barChartContainer}>
        <Text style={styles.chartTitle}>Distribution Chart</Text>
        {data.map((item, index) => {
          const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const totalPercentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
          const color = colors[index % colors.length];
          
          return (
            <View key={index} style={styles.barChartItem}>
              <View style={styles.barChartHeader}>
                <View style={styles.barChartLabel}>
                  <View 
                    style={[
                      styles.colorDot,
                      { backgroundColor: color }
                    ]} 
                  />
                  <Text style={styles.barChartName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.barChartPercent}>
                  {totalPercentage}%
                </Text>
              </View>
              
              <View style={styles.barChartBar}>
                <View 
                  style={[
                    styles.barChartFill,
                    { 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }
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

  // Progress Ring Chart (Alternative)
  const ProgressRingChart = ({ data }) => {
    return (
      <View style={styles.ringChartContainer}>
        <Text style={styles.chartTitle}>Progress Overview</Text>
        <View style={styles.ringChart}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.amount / total) * 100 : 0;
            const color = colors[index % colors.length];
            
            return (
              <View key={index} style={styles.ringItem}>
                <View style={styles.ringInfo}>
                  <View 
                    style={[
                      styles.ringColor,
                      { backgroundColor: color }
                    ]} 
                  />
                  <View style={styles.ringTextContainer}>
                    <Text style={styles.ringName}>{item.name}</Text>
                    <Text style={styles.ringAmount}>Rs. {item.amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.ringProgressContainer}>
                  <View style={styles.ringProgressBar}>
                    <View 
                      style={[
                        styles.ringProgressFill,
                        { 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.ringPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#4A0000', '#1A0000']} style={styles.container}>
      <AppHeader title={title} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Summary Card */}
        <LinearGradient
          colors={['#B83232', '#4A0000']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Current Balance</Text>
            <Icon
              name={isUp ? 'arrow-up-bold' : 'arrow-down-bold'}
              color={isUp ? '#00FF88' : '#FF4C4C'}
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
                { color: isUp ? '#00FF88' : '#FF4C4C' },
              ]}
            >
              {isUp ? '+' : ''}
              {difference.toLocaleString()} ({isUp ? '+' : ''}
              {percentageChange}%)
            </Text>
          </View>
        </LinearGradient>

        {/* Chart Section - Using Simple Bar Chart */}
        {data.length > 0 && (
          <View style={styles.chartSection}>
            <SimpleBarChart data={data} />
          </View>
        )}

        {/* Alternative: Progress Ring Chart (Uncomment to use) */}
        {/* {data.length > 0 && (
          <View style={styles.chartSection}>
            <ProgressRingChart data={data} />
          </View>
        )} */}

        {/* Detailed List */}
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
            <Icon name="chart-line" size={50} color="#FFD700" />
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
    borderColor: 'rgba(255,215,0,0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
  currentAmount: {
    color: '#fff',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Bar Chart Styles
  barChartContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  barChartItem: {
    marginBottom: 20,
  },
  barChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barChartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  barChartName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  barChartPercent: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
  },
  barChartBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  barChartFill: {
    height: '100%',
    borderRadius: 5,
  },
  barChartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barChartAmount: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  barChartPercentage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  // Progress Ring Chart Styles
  ringChartContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ringChart: {
    // Styles for ring chart items
  },
  ringItem: {
    marginBottom: 15,
  },
  ringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ringColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  ringTextContainer: {
    flex: 1,
  },
  ringName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ringAmount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  ringProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  ringProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  ringPercentage: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  listHeader: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 16,
  },
  percentageBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3,
  },
  percent: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'right',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 10,
  },
});

export default MoreDetailScreen;