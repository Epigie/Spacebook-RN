import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Button, HStack, Image, Text, ScrollView, Modal, Input, AlertDialog, VStack, FlatList} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Draft from '../assets/Draft';



class Settings extends Component{
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
     showCMenu : false,
     showPMenu : false,
     showDMenu : false,
     errorOpen : false,
     errorDialog : '',
    }
  }

  uhOhError = (error, tc) =>{
    this.setState({errorOpen : true, errorDialog: error});
    if(tc == null){
      throw(error)
    }
}


  storeValues = async () =>{
    const id = await AsyncStorage.getItem('@USERID');
    const token = await AsyncStorage.getItem('@AUTHTOKEN');
    const drafts = await AsyncStorage.getItem('@storedPosts');
    const draftjson = JSON.parse(drafts)
    draftjson != null? this.setState({drafts:draftjson['posts']}):this.setState({drafts:null})
    this.setState({id : id, AuthToken : token});
  }

  refreshDrafts = async () =>{
    const drafts = await AsyncStorage.getItem('@storedPosts');
    const draftjson = JSON.parse(drafts)
    this.setState({drafts : draftjson['posts']});
  }

  checkFocus = async () => {
    const value = await AsyncStorage.getItem('@AUTHTOKEN');
    if (value != null) {
      await this.storeValues();
    }
  };

  componentDidMount = () => {
    this.unsubscribe = this.props.navigation.addListener('focus', () =>{
      this.checkFocus();
    })
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  updatePW = async (token,id) => {
    const json = () => {
      const arr = []
      this.state.newPW !== 'undefined'? arr.push(['password', this.state.newPW]) : {}
      const obj = Object.fromEntries(new Map(arr));
      return obj;
    }
    fetch('http://localhost:3333/api/1.0.0/user/'+id, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization' : this.state.AuthToken,
      },
      body: JSON.stringify(json())
    })
    .then( async (response) => {
      if(response.status === 200){
        this.setState({showPMenu : false})
        this.props.navigation.navigate('Profile')
      }
    })
    .catch((error) => {
      this.uhOhError(error);
    })
        
  }

  updateProfile = async (token,id) => {
    const json = () => {
      const arr = []
      this.state.newFName !== 'undefined'? arr.push(['first_name', this.state.newFName]) : {}
      this.state.newLName !== 'undefined'? arr.push(['last_name', this.state.newLName]) : {}
      this.state.newEmail !== 'undefined'? arr.push(['email', this.state.newEmail]) : {}
      const obj = Object.fromEntries(new Map(arr));
      return obj;
    }
    fetch('http://localhost:3333/api/1.0.0/user/'+id, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization' : this.state.AuthToken,
      },
      body: JSON.stringify(json())
    })
    .then( async (response) => {
      if(response.status === 200){
        this.setState({showCMenu : false})
        this.props.navigation.navigate('Profile')
      }
    })
    .catch((error) => {
      this.uhOhError(error);
    })
        
  }

  deleteDraft = async (postID) =>{
    this.setState({drafts:null})
    let json;
    let newarr = {'posts':[]}
    const currDrafts = await AsyncStorage.getItem('@storedPosts')
    const objarr = JSON.parse(currDrafts)
    objarr['posts'].splice((postID-1),1);
    for(var i=0; i<objarr['posts'].length;i++){
      newarr['posts'].push({'id':(i+1), 'date':objarr['posts'][i]['date'], 'post':objarr['posts'][i]['post'] })
    }
    json = JSON.stringify(newarr)
    await AsyncStorage.setItem('@storedPosts', json)
    this.refreshDrafts();
  }

  EditDraft = async (postID, date, text) =>{
    let json;
    const currDrafts = await AsyncStorage.getItem('@storedPosts')
    const objarr = JSON.parse(currDrafts)
    objarr['posts'].splice((postID-1),1,{'id':postID, 'date': date, 'post': text} );
    json = JSON.stringify(objarr)
    await AsyncStorage.setItem('@storedPosts', json)
    this.setState({drafts:null}, ()=>{this.refreshDrafts();})
  }

  renderDraft = ({item}) => {
    return(<Draft id={item.id} text={item.post} datetime={item.date} refreshDrafts={this.refreshDrafts} uhOhError={this.uhOhError} deleteDraft={this.deleteDraft} AuthToken={this.state.AuthToken} userID={this.state.id} editDraft={this.EditDraft}/>);
  }

  logout = () =>{
    fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'POST',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      if(response.status === 200){
        await AsyncStorage.removeItem('@AUTHTOKEN');
        await AsyncStorage.removeItem('@USERID');
        this.props.navigation.navigate('Login')
      }
      else{
        throw('Something went wrong logging you out! Please try again.')
      }
    })
    .catch((error) => {
      this.uhOhError(error);
    })

  }

  render(){
    return(
      <NativeBaseProvider>
        <AlertDialog leastDestructiveRef={this.ref} isOpen={this.state.errorOpen} onClose={() => this.setState({errorOpen: false, errorDialog: ''})}>
          <AlertDialog.Content>
            <AlertDialog.Header fontSize={'lg'} fontWeight={'bold'}>Error!</AlertDialog.Header>
            <AlertDialog.Body>{this.state.errorDialog}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button cancelRef={this.ref} colorScheme={'danger'} onPress={() => this.setState({errorOpen: false, errorDialog: ''})}>Okay</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
        <Modal isOpen={this.state.showCMenu} onClose={() => this.setState({showCMenu: false})}>
            <Modal.Content maxWidth='400px' marginBottom={'auto'} mt={5}>
                <Modal.CloseButton />
                <Modal.Header>Edit Profile</Modal.Header>
                <Modal.Body>
                  <VStack space={3} mb={5} width='100%' >
                  <HStack space={2} alignSelf={'center'} width='100%'>
                    <Text fontSize={'medium'} bold ml={3} mr={'auto'}>First Name: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => this.setState({newFName: value})} name="Name"/>
                    </HStack>
                    <HStack space={2} alignSelf={'center'}  width='100%'>
                    <Text fontSize={'medium'} ml={3} mr={'auto'} bold>Last Name: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => this.setState({newLName: value})} name="Name"/>
                    </HStack>
                    <HStack space={2} alignSelf={'center'} justifyContent={'flex-end'} width='100%'>
                    <Text fontSize={'medium'} ml={3} mr={'auto'} bold>Email: </Text>
                    <Input borderColor={'darkBlue.900'} borderWidth={2}  placeholder="First Name" marignLeft={'auto'} marginRight={3} onChangeText={(value) => this.setState({newEmail: value})} name="Name"/>
                    </HStack>
                  </VStack>
                  <Button onPress={() => this.updateProfile(this.state.AuthToken, this.state.id)} colorScheme='darkBlue' leftIcon={<Ionicons name='arrow-up' color='white'/>}>Submit..</Button>
                </Modal.Body>
              </Modal.Content>
            </Modal>
            <Modal isOpen={this.state.showPMenu} onClose={() => this.setState({showPMenu: false})}>
            <Modal.Content maxWidth='400px' marginBottom={'auto'} mt={5}>
                <Modal.CloseButton />
                <Modal.Header>Change Password</Modal.Header>
                <Modal.Body>
                  <VStack space={3} mb={5} width='100%' >
                  <HStack space={2} alignSelf={'center'} width='100%'>
                    <Text fontSize={'medium'} bold ml={3} mr={'auto'}>New Password: </Text>
                    <Input type='password' borderColor={'darkBlue.900'} borderWidth={2}  marignLeft={'auto'} marginRight={3} onChangeText={(value) => this.setState({newPW: value})} name="Name"/>
                    </HStack>
                  </VStack>
                  <Button onPress={() => this.updatePW(this.state.AuthToken, this.state.id)} colorScheme='darkBlue' leftIcon={<Ionicons name='arrow-up' color='white'/>}>Submit..</Button>
                </Modal.Body>
              </Modal.Content>
            </Modal>
            <Modal isOpen={this.state.showDMenu} onClose={() => this.setState({showDMenu: false})}>
            <Modal.Content maxWidth='400px' marginBottom={'auto'} mt={5}>
                <Modal.CloseButton />
                <Modal.Header>Edit Drafts</Modal.Header>
                <Modal.Body>
                  <ScrollView>
                    <FlatList extradata={this.state} data={this.state.drafts} renderItem={this.renderDraft}></FlatList>
                    </ScrollView>
                </Modal.Body>
              </Modal.Content>
            </Modal>
        <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%" justifyContent='center'><Heading size="xl" color="light.100" textAlign="left" ml='2'>Settings</Heading></Box>
        <VStack mb={10} mt={10}space={3} alignSelf={'center'} width='100%' justifyContent={'center'} alignItems={'center'}>
          <Button colorScheme={'darkBlue'} variant={'subtle'} width={'90%'} onPress={() =>{this.setState({showCMenu : true})}}>Edit Your Profile</Button>
          <Button colorScheme={'darkBlue'} variant={'subtle'} width={'90%'} onPress={() =>{this.setState({showPMenu : true})}}>Change Your Password</Button>
          <Button colorScheme={'darkBlue'} variant={'subtle'} width={'90%'} onPress={() =>{this.state.drafts != null? this.setState({showDMenu : true}):this.uhOhError('You do not have any drafts!',false)}}>Edit Your Drafts</Button>
          <Button colorScheme={'danger'} variant={'subtle'} width={'90%'} onPress={() =>{this.logout()}}>Log Out</Button>

        </VStack>
        <Image marignTop={'auto'} marginBottom={3} alignSelf={'center'} source={require('../assets/logo.png')} size="lg" resizeMode="center"/>
        <Text marignTop={'auto'} marginBottom={2} alignSelf={'center'}>SpaceBook v1.0</Text>
      </NativeBaseProvider>
    );
  }
}



export default Settings;
