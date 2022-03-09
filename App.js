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
  const [isOpen, setIsOpen] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState('');
  const cancelRef = null
  const closeError = () =>{
      setIsOpen(false);
      setErrorDialog('');
    }
  return (
    <NavigationContainer>
      <StackNav.Navigator screenOptions={{ headerShown: false }}>
        <StackNav.Screen name="Main" component={Main} />
        <StackNav.Screen name="Login" component={LogIn} isOpen={isOpen} setIsOpen={setIsOpen} errorDialog={errorDialog} setErrorDialog={setErrorDialog} ref={cancelRef} closeError={closeError}/>
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default nav;
