/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Stack, Icon, Input, FormControl, Image, Button} from 'native-base';
import {MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




class Log_in_page extends Component {

  constructor(props) {
    super(props);
    this.state = {loggedin: false};
  }

  checkLogin() {
    const authToken = async () =>{
      try {
       await AsyncStorage.getItem('AUTHTOKEN');
        if (authToken != null){
          //Needs to check against the API whether the key is active. if it is set logged in to true.
        }
        else {
          this.setState({loggedin: false }); //If the token is blank, then there is no logged in user.
        }
      } catch (e){
        console.log(e);
      }
    };
  }

  logIn() {

  }

  stateStorer(event = {}){
    const compName = event.target && event.target.name;
    const compVal = event.target && event.target.value;

    this.setState({[compName]: compVal});
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
          }} InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="light.600"/>} placeholder="Email" variant="rounded" value={this.state.email} onChangeText={this.stateStorer} name="Email"/>
        </Stack>
      </FormControl>
      <FormControl isRequired>
      <FormControl.Label ml="5">Password</FormControl.Label>
      <Stack space={5} w="80%" alignItems="center" alignSelf="center" mb="5">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputRightElement={<Icon as={<MaterialIcons name="visibility-off" />} size={5} ml="2" color="light.600"/>} placeholder="password" variant="rounded" type="password" value={this.state.password} onChangeText={this.stateStorer} name="Password" />
        </Stack>

      </FormControl>
      <Button isLoading isLoadingText="Logging In" onPress={console.log('lolol')} alignSelf="center" colorScheme="light"> Log In</Button>
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
      </Center>
    </NativeBaseProvider>
  );
}

export default App;
