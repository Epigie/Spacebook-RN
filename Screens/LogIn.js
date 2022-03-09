/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {Alert} from 'react-native';
import {NativeBaseProvider, Box, Heading, Center, Stack, Icon, Input, FormControl, Image, Button, Link, HStack, AlertDialog} from 'native-base';
import {MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';





class Log_in_page extends Component {

  constructor(props) {
    super(props);
    this.ref=React.createRef();
    this.state = {
      loggedin: false,
      errorOpen: false,
      errorDialog: ''
    };
  }

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
}



  getToken = async () => {
    console.log(this.state.email);
    console.log(this.state.password);
    return fetch('http://localhost:3333/api/1.0.0/Login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
    .then( async (response) => {
      console.log(response);
      if(response.status === 200){
        const jsonbody = await response.json()
        console.log(jsonbody)
        const token = jsonbody.token;
        const id = JSON.stringify(jsonbody.id);
        await AsyncStorage.setItem('@AUTHTOKEN', token);
        await AsyncStorage.setItem('@USERID', id);
        this.setState({AuthToken: token});
        this.setState({UserID: id});
        this.setState({loggedin: true});
        try {
          const jsonval = await AsyncStorage.getItem('@AUTHTOKEN');
          const idval = await AsyncStorage.getItem('@USERID');
          jsonval != null ? console.log('Async is: ' + jsonval) : console.log("It's null???");
          idval != null ? console.log('ID Async is: ' + JSON.parse(idval)) : console.log("It's null???");
          console.log('State is: ' + this.state.AuthToken);
          console.log('ID State is: ' + JSON.parse(this.state.UserID));
        }
        catch (err) {
          console.error(err);
        }
        this.props.navigation.navigate('Main');
      } else{
        this.uhOhError('Incorrect User or Password')
      }
    })
    .catch((error) => {
      console.error(error);
      Alert.alert(
        "Error",
        error,
        [
          {
            text: 'Ok',
            style: 'cancel'
          }
        ]
      );
    });
  };

  render() {
    return (
    <Center mt="5" mb="5" alignSelf="center" bg="light.100" width="75%" rounded="lg">
      <AlertDialog leastDestructiveRef={this.ref} isOpen={this.state.errorOpen} onClose={() => this.setState({errorOpen: false, errorDialog: ''})}>
          <AlertDialog.Content>
            <AlertDialog.Header fontSize={'lg'} fontWeight={'bold'}>Error!</AlertDialog.Header>
            <AlertDialog.Body>{this.state.errorDialog}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button cancelRef={this.ref} colorScheme={'danger'} onPress={() => this.setState({errorOpen: false, errorDialog: ''})}>Okay</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      <FormControl isRequired>
      <FormControl.Label ml="5" mt="2">E-mail</FormControl.Label>
        <Stack space={5} w="80%" alignItems="center" alignSelf="center">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="light.600"/>} placeholder="Email"   onChangeText={(value) => this.setState({email: value})} name="Email"/>
        </Stack>
      </FormControl>
      <FormControl isRequired>
      <FormControl.Label ml="5">Password</FormControl.Label>
      <Stack space={5} w="80%" alignItems="center" alignSelf="center" mb="5">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputRightElement={<Icon as={<MaterialIcons name="visibility-off" />} size={5} ml="2" color="light.600"/>} placeholder="Password"  type="password" onChangeText={(value) => this.setState({password: value})} name="Password" />
        </Stack>

      </FormControl>
      <Center alignSelf="center" md="5">
      <Button alignSelf="center" colorScheme="light" onPress={() => this.getToken()}> Log In</Button>
      </Center>
    </Center>
    );
  }
}

class Login_links extends Component {
  constructor(props){
    super(props);
  }

  openSignUp = () => {
    console.log("Sign Up Pressed")
  }

  openPassReset = () => {
    console.log("Reset Password")
  }

  render(){
    return (
      <Center alignSelf="center" mt="2">
        <HStack space={5} justifyContent="center">
          <Link onPress={() => this.openSignUp()}>Sign Up</Link>
          <Link onPress={() => this.openPassReset()}>Forgotten Password?</Link>
        </HStack>
      </Center>
    );
  }
}

export function LogIn({navigation}) {

  return (
    <NativeBaseProvider>
      <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%"><Heading size="2xl" color="light.100" textAlign="center">Welcome to Spacebook</Heading></Box>
      <Center>
        <Image source={require('../assets/logo.png')} size="lg" resizeMode="center"/>
        <Log_in_page navigation={navigation} />
        <Login_links />
      </Center>
    </NativeBaseProvider>
  );
}

