/* eslint-disable prettier/prettier */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LogIn from './Screens/LogIn.js';


const StackNav = createStackNavigator();

function nav() {
  return (
    <NavigationContainer>
      <StackNav.Navigator>
        <StackNav.Screen name="Login" component={LogIn}/>
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default nav;
