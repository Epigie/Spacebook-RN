import React, {Component} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Profile from './Profile.js';
import Search from './Search.js';
import Settings from './Settings.js';

const Tab = createBottomTabNavigator();
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {loggedIn: null}
  }

  getLogin = async () => {
    const token = await AsyncStorage.getItem('@AUTHTOKEN');
    const id = await AsyncStorage.getItem('@USERID');
    if(token !== null){
      try{
        return fetch(
          'http://localhost:3333/api/1.0.0/user/' + JSON.parse(id),
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'X-Authorization': token,
            },
          },
        )
          .then((response) =>{
            if(response.status === 200){
              return response.json()
            } else if(response.status === 401){
              this.props.navigation.navigate("Login");
            } else{
              throw 'An Error has occured! ';
            }
          })
          .then((json) => {
            this.setState({
              listdata: json,
              loggedIn: true
            })
          })
      } catch(error){
        console.error(error);

      }
      }else{
        this.props.navigation.navigate("Login");
        throw 'The token is empty!'
      }
  };

  checkLogIn = async () => {
    const value = await AsyncStorage.getItem('@AUTHTOKEN');
    if (value == null) {
        this.props.navigation.navigate('Login');
    }
  };

  componentDidMount = () => {
    this.unsubscribe = this.props.navigation.addListener('focus', () =>{
      this.checkLogIn();
    })
    this.getLogin();
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Profile" component={Profile} options={{
      tabBarLabel: 'Your Profile',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="person-circle" color={color} size={size} />
      ),
    }} />
        <Tab.Screen name="Search" component={Search} options={{
      tabBarLabel: 'Search for Friends',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="search" color={color} size={size} />
      ),
    }} />
        <Tab.Screen name="Settings" component={Settings} options={{
      tabBarLabel: 'Settings',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings" color={color} size={size} />
      ),
    }} />
      </Tab.Navigator>
    );
  }
}

export default Main;
