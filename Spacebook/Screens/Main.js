import React, {Component} from 'react';
import {
  NativeBaseProvider,
  Box,
  Heading,
  Center,
  Stack,
  Icon,
  Input,
  FormControl,
  Image,
  Button,
  Link,
  HStack,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Profile from './Profile.js';
import Search from './Search.js';
import Settings from './Settings.js';

class Top_Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {loggedin: false};
  }

  Tab = createBottomTabNavigator();

  render() {
    return (
      <NavigationContainer>
        <this.Tab.Navigator>
          <this.Tab.Screen name="Profile" component={Profile} />
          <this.Tab.Screen name="Search" component={Search} />
          <this.Tab.Screen name="Settings" component={Settings} />
        </this.Tab.Navigator>
      </NavigationContainer>
    );
  }
}

function Main_Screen() {
  return <Top_Tree />;
}

export default Main_Screen;
