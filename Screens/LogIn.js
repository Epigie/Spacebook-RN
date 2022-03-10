/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Stack, Input, FormControl, Image, Button, Link, HStack, AlertDialog, Modal, VStack, Text, Pressable} from 'native-base';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';





class Log_in_page extends Component {

  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      loggedin: false,
      errorOpen: false,
      errorDialog: '',
      showPW: false,
    };
  }

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
}



  getToken = async () => {
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
      if(response.status === 200){
        const jsonbody = await response.json()
        const token = jsonbody.token;
        const id = JSON.stringify(jsonbody.id);
        await AsyncStorage.setItem('@AUTHTOKEN', token);
        await AsyncStorage.setItem('@USERID', id);
        this.setState({AuthToken: token});
        this.setState({UserID: id});
        this.setState({loggedin: true});
        this.props.navigation.navigate('Main');
      } else{
        this.uhOhError('Incorrect User or Password')
      }
    })
    .catch((error) => {
      console.error(error);
    })
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
          }} InputLeftElement={<Ionicons  name="person" size={'large'} ml="2" color="light.600"/>} placeholder="Email"   onChangeText={(value) => this.setState({email: value})} name="Email"/>
        </Stack>
      </FormControl>
      <FormControl isRequired>
      <FormControl.Label ml="5">Password</FormControl.Label>
      <Stack space={5} w="80%" alignItems="center" alignSelf="center" mb="5">
          <Input w={{
            base: "75%",
            md: "25%"
          }} InputRightElement={<Pressable onPress={() => this.setState({showPW : !this.state.showPW})}><Ionicons  name={this.state.showPW == false? "eye-off": "eye"} size={'large'} ml="2" color="light.600"/></Pressable>} placeholder="Password"  type={this.state.showPW==false? "password": {}} onChangeText={(value) => this.setState({password: value})} name="Password" />
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
    this.ref = React.createRef();
    this.state ={
      errorOpen: false,
      errorDialog : '',
    };
  }

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
  }

  openSignUp = () => {
    this.props.setOpenSignUp(true);
  } 

  SignUp = async () => {
    fetch('http://localhost:3333/api/1.0.0/user/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: this.props.getValues()
    })
    .then( async (response) => {
      if(response.status === 200){
        this.props.setOpenSignUp(false)
      }
    })
    .catch((error) => {
      this.uhOhError(error);
    })
  }

  render(){
    return (
      <Center alignSelf="center" mt="2">
        <AlertDialog leastDestructiveRef={this.ref} isOpen={this.state.errorOpen} onClose={() => this.setState({errorOpen: false, errorDialog: ''})}>
          <AlertDialog.Content>
            <AlertDialog.Header fontSize={'lg'} fontWeight={'bold'}>Error!</AlertDialog.Header>
            <AlertDialog.Body>{this.state.errorDialog}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button cancelRef={this.ref} colorScheme={'danger'} onPress={() => this.setState({errorOpen: false, errorDialog: ''})}>Okay</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
        <HStack space={1} justifyContent="center">
          <Link onPress={() => this.openSignUp()}>Sign Up</Link>
        </HStack>
      </Center>
    );
  }
}

export function LogIn({navigation}) {
  const [openSignUp, setOpenSignUp] = React.useState(false);
  const [signUpFName, setSignUpFName] = React.useState(null);
  const [signUpLName, setSignUpLName] = React.useState(null);
  const [signUpEmail, setSignUpEmail] = React.useState(null);
  const [signUpPW, setSignUpPW] = React.useState(null);
  const getSignUp = async () =>{
    const arr = [['first_name',signUpFName],['last_name',signUpLName],['email',signUpEmail],['password',signUpPW]]
    const obj = Object.fromEntries(new Map(arr));
    setSignUpFName(null);
    setSignUpLName(null);
    setSignUpEmail(null);
    setSignUpPW(null);
    fetch('http://localhost:3333/api/1.0.0/user/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj)
    })
    .then( async (response) => {
      if(response.status === 201){
        setOpenSignUp(false)
      }
    })
    .catch((error) => {
      this.uhOhError(error);
    })
  }
  return (
    <NativeBaseProvider>
       <Modal isOpen={openSignUp} onClose={() => setOpenSignUp(false)}>
            <Modal.Content maxWidth='400px' marginBottom={'auto'} mt={5}>
                <Modal.CloseButton />
                <Modal.Header>Sign Up!</Modal.Header>
                <Modal.Body>
                  <VStack space={3} mb={5} width='100%' >
                    <HStack space={2} alignSelf={'center'} width='100%'>
                    <Text fontSize={'medium'} bold ml={3} mr={'auto'}>First Name: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => setSignUpFName(value)} name="Name"/>
                    </HStack>
                    <HStack space={2} alignSelf={'center'}  width='100%'>
                    <Text fontSize={'medium'} ml={3} mr={'auto'} bold>Last Name: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => setSignUpLName(value)} name="Name"/>
                    </HStack>
                    <HStack space={2} alignSelf={'center'} justifyContent={'flex-end'} width='100%'>
                    <Text fontSize={'medium'} ml={3} mr={'auto'} bold>Email: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => setSignUpEmail(value)} name="Name"/>
                    </HStack>
                    <HStack space={2} alignSelf={'center'} width='100%'>
                    <Text fontSize={'medium'} bold ml={3} mr={'auto'}>Password: </Text>
                    <Input type='password' borderColor={'darkBlue.900'} borderWidth={2}  marignLeft={'auto'} marginRight={3} onChangeText={(value) => setSignUpPW(value)} name="Name"/>
                    </HStack>
                  </VStack>
                  <Button onPress={() => getSignUp()} colorScheme='darkBlue' leftIcon={<Ionicons name='arrow-up' color='white'/>}>Submit..</Button>
                </Modal.Body>
              </Modal.Content>
            </Modal>
      <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%"><Heading size="2xl" color="light.100" textAlign="center">Welcome to Spacebook</Heading></Box>
      <Center>
        <Image mt={5} source={require('../assets/logo.png')} size="lg" resizeMode="center"/>
        <Log_in_page navigation={navigation} />
        <Login_links setOpenSignUp={setOpenSignUp} />
      </Center>
    </NativeBaseProvider>
  );
}

