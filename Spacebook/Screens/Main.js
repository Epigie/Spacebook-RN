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

const Tab = createBottomTabNavigator();
class Top_Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {loggedin: false};
  }

  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    );
  }
}

function Main_Screen() {
  return <Top_Tree />;
}

export default Main_Screen;
