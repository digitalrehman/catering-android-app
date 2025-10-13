import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import Quotation from '../screens/Quotation/Quotation';
import EventCalendarScreen from '../screens/EventCalendar/EventCalendarScreen';
import EventDetailScreen from '../screens/EventCalendar/EventDetailScreen';
import ManagementScreen from '../screens/Modules/management/ManagementScreen';
import SalesScreen from '../screens/Modules/SalesScreen';
import KitchenScreen from '../screens/Modules/kitchen/KitchenScreen';
import MoreDetailScreen from '../screens/Modules/management/MoreDetailScreen';
import HFScreen from '../screens/Modules/kitchen/HFScreen';
let Stack = createNativeStackNavigator();

const Main = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Quotation" component={Quotation} />
      <Stack.Screen name="EventCalendar" component={EventCalendarScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Management" component={ManagementScreen} />
      <Stack.Screen name="Sales" component={SalesScreen} />
      <Stack.Screen name="Kitchen" component={KitchenScreen} />
      <Stack.Screen name="MoreDetail" component={MoreDetailScreen} />
      <Stack.Screen name="HF" component={HFScreen} />

    </Stack.Navigator>
  );
};

export default Main;
