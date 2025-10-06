import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.Data.currentData);
  console.log(user);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.user_id}</Text>
      <TouchableOpacity
        onPress={() => dispatch(setLogout())}
        style={{ backgroundColor: 'red', padding: 10, marginTop: 20, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;
