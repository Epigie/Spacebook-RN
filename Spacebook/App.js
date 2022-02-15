/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Stack, Icon, Input, FormControl, Image, Button, Link, HStack} from 'native-base';
import {MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




class Log_in_page extends Component {

  constructor(props) {
    super(props);
    //this.stateStorer = this.stateStorer.bind(this);
    this.state = {loggedin: false};
  }

  checkLogin() {
    const authToken = async () =>{
      try {
       const token = await AsyncStorage.getItem('@AUTHTOKEN');
        if (token != null){
          this.setState({loggedin: true });
          this.setState({AuthToken: token});
          //Needs to check against the API whether the key is active. if it is set logged in to true.
        }
        else {
          this.setState({loggedin: false }); //If the token is blank, then there is no logged in user.
        }
      } catch (e){
        console.log(e);
      }
    };
    authToken();
  }

  async logIn() {
    const getToken = () => {
      console.log(this.state.email);
      console.log(this.state.password);
      return fetch('http://10.0.2.2:3333/api/1.0.0/Login', {
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
      .then ((response) => response.json())
      .then ((json) => {
        this.setState({AuthToken: json.token});
        return json.token;
      })
      //Said to sort out the async issue here.  Code is executing too late
      .catch((error) => {
        console.error(error);
      });
    };
    getToken();
    console.log(this.state.AuthToken);
    try {
        await AsyncStorage.setItem('@AUTHTOKEN', this.state.AuthToken);
        console.log( await AsyncStorage.getItem('@AUTHTOKEN'));
      }
      catch (err) {
        console.error(err);
      }
  }

  render() {
    return (
    <Center mt="5" mb="5" alignSelf="center" bg="light.100" width="75%" rounded="lg">
      <FormControl isRequired>
      <FormControl.Label ml="5" mt="2">E-mail</FormControl.Label>
        <Stack space={5} w="80%" alignItems="center" alignSelf="center">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="light.600"/>} placeholder="Email" variant="rounded"  onChangeText={(value) => this.setState({email: value})} name="Email"/>
        </Stack>
      </FormControl>
      <FormControl isRequired>
      <FormControl.Label ml="5">Password</FormControl.Label>
      <Stack space={5} w="80%" alignItems="center" alignSelf="center" mb="5">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputRightElement={<Icon as={<MaterialIcons name="visibility-off" />} size={5} ml="2" color="light.600"/>} placeholder="Password" variant="rounded" type="password" onChangeText={(value) => this.setState({password: value})} name="Password" />
        </Stack>

      </FormControl>
      <Center alignSelf="center" md="5">
      <Button alignSelf="center" colorScheme="light" onPress={() => this.logIn()}> Log In</Button>
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
          <Link onPress={this.openSignUp}>Sign Up</Link>
          <Link>Forgotten Password?</Link>
        </HStack>
      </Center>
    );
  }
}

function App() {
  return (
    <NativeBaseProvider>
      <Box alignSelf="center" bg="light.400" width="100%" height="5%"><Heading size="2xl" color="light.900" textAlign="center">Welcome to Spacebook</Heading></Box>
      <Center>
        <Image source={require('./assets/logo.png')} size="lg" resizeMode="center"/>
        <Log_in_page />
        <Login_links />
      </Center>
    </NativeBaseProvider>
  );
}

export default App;
