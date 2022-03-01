/* eslint-disable prettier/prettier */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {LogIn} from './Screens/LogIn.js';
import Main_Screen from './Screens/Main.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function checkLogin() {
  const authToken = async () => {
    try {
      const token = await AsyncStorage.getItem('@AUTHTOKEN');
      const id = await AsyncStorage.getItem('@USERID');
      if (token != null) {
        const getLogin = async (...apitoken) => {
          return await fetch(
            'http://10.0.2.2:3333/api/1.0.0/User/' + JSON.parse(id),
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'X-Authorization': apitoken[0],
              },
            },
          )
            .then(response => response.status())
            .then(code => {
              const statuscode = code;
              return statuscode === 200 ? true : false;
            });
        };
        return getLogin(token) === true ? true : false;
      } else {
        return false; //If the token is blank, then there is no logged in user.
      }
    } catch (e) {
      console.log(e);
    }
  };
  authToken();
}


const StackNav = createStackNavigator();

function nav() {
  return (
    <NavigationContainer>
      <StackNav.Navigator>
        {/* {console.log(checkLogin())} */}
        {/* {checkLogin() === true ? */}
        <StackNav.Screen name="Main" component={Main_Screen}/>
        <StackNav.Screen name="Login" component={LogIn} />
      {/* } */}
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default nav;
