import React, {Component} from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Profile from './Profile.js';
import Search from './Search.js';
import Settings from './Settings.js';
import FriendRequests from './FriendRequests.js';

const Tab = createBottomTabNavigator();
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: null,
      requests : 0,
      friendRequestData : null,
      frLoading : false
    }
  }

  getFriendReq = async (id, token) =>{
    this.setState({frLoading: true})
    fetch('http://localhost:3333/api/1.0.0/friendrequests', {
        method: 'GET',
        headers: {
          'X-Authorization' : token,
          'Accept' : 'application/json'
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code === 200){
          const jsonbody = await response.json();
          const number = Object.keys(jsonbody).length;
          if(number > 0){

            this.setState({requests : number, friendRequestData : jsonbody}, () => {this.setState({frLoading:false})});
          }
          else{
            this.setState({requests : 0, friendRequestData : null}, () => {this.setState({frLoading:false})});
          }
        }
        else{
          throw('Something has gone wrong grabbing the users profile picture.');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
  }

  getLogin = async (id, token) => {
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
              throw 'An Error has occured! Please Login again ';
            }
          })
          .then((json) => {
            this.setState({
              listdata: json,
              loggedIn: true
            })
          })
      } catch(error){
        this.props.navigation.navigate('Login');
        console.error(error);

      }
      }else{
        this.props.navigation.navigate("Login");
        throw 'The token is empty!'
      }
  };

  checkLogIn = async () => {
    const value = await AsyncStorage.getItem('@AUTHTOKEN');
    const id = await AsyncStorage.getItem('@USERID');
    if (value == null) {
        this.props.navigation.navigate('Login');
    }
    else{
      this.setState({AuthToken : value, id : id}, () => {this.getLogin(this.state.id, this.state.AuthToken); this.getFriendReq(this.state.id, this.state.AuthToken)});
    }
  };

  componentDidMount = () => {
    this.unsubscribe = this.props.navigation.addListener('focus', () =>{
      this.checkLogIn();
    })
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Profile" component={Profile} options={{
      tabBarLabel: 'Your Profile',
      tabBarLabelPosition: 'below-icon',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="person-circle" color={color} size={size} />
      ),
    }} />
        <Tab.Screen name="Search" component={Search} options={{
      tabBarLabel: 'Search for Friends',
      tabBarLabelPosition: 'below-icon',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="search" color={color} size={size} />
      ),
    }} />
        <Tab.Screen name="Requests" options={this.state.requests > 0? {
      tabBarLabel: 'Requests',
      tabBarLabelPosition: 'below-icon',
      tabBarBadge: this.state.requests,
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="people-circle" color={color} size={size} />
      ),
    }: {tabBarLabel: 'Requests',tabBarLabelPosition: 'below-icon', tabBarIcon: ({ color, size }) => (
      <Ionicons name="people-circle" color={color} size={size} />
    ), }}>
      {props => <FriendRequests {...props} friendData={this.state.friendRequestData} getFriendRequests={this.getFriendReq} isLoading={this.state.frLoading} numReq={this.state.requests} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={Settings} options={{
        tabBarLabel: 'Settings',
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings" color={color} size={size} />
        ),
      }} />
      </Tab.Navigator>
    );
  }
}

export default Main;
