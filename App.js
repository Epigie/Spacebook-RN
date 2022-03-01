/* eslint-disable prettier/prettier */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {LogIn} from './Screens/LogIn.js';
import Main from './Screens/Main.js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const StackNav = createStackNavigator();

function nav() {
  return (
    <NavigationContainer>
      <StackNav.Navigator screenOptions={{ headerShown: false }}>
        {/* {console.log(checkLogin())} */}
        {/* {checkLogin() === true ? */}
        <StackNav.Screen name="Main" component={Main} />
        <StackNav.Screen name="Login" component={LogIn} />
      {/* } */}
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default nav;
