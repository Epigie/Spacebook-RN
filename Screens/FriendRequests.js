import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Button, HStack, Avatar, TextArea, VStack, Spinner, FlatList, Text, ScrollView, Modal, Input, AlertDialog, PresenceTransition} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Request from '../assets/Request.js'


class FriendRequests extends Component {
  constructor(props){
    super(props);
    this.ref=React.createRef();
    this.state = {
      errorOpen : false,
      errorDialog : null,
    }
  }

  //Error Handling

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
  }

  friendUpdated = (added,name) =>{ //Handles the pretty popup
      this.setState({requestAction : added, friendName : name}, () => {
        this.setState({updatedfriendo : true})
        setTimeout(() => {this.setState({updatedfriendo : false }, () => setTimeout(() => this.setState({requestAction : null, friendName : null}), 3000))}, 3000 );

      });
  }

  refreshRequests = () => {
    this.props.getFriendRequests(this.state.id, this.state.AuthToken)
  }

  renderRequest = ({item}) => {
    return(<Request userID={item.user_id} fName={item.first_name} lName={item.last_name} navigation={this.props.navigation} friendUpdated={this.friendUpdated} refreshRequests={this.refreshRequests} uhOhError={this.uhOhError} />);
  }

  storeValues = async (token, id) =>{
    this.setState({id : id, AuthToken : token});
  }

  checkFocus = async () => {
    const value = await AsyncStorage.getItem('@AUTHTOKEN');
    const id = await AsyncStorage.getItem('@USERID');
    if (value != null) {
      this.setState({id : id, AuthToken : value});
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
        <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%" justifyContent='center'><Heading size="xl" color="light.100" textAlign="left" ml='2'>Friend Requests</Heading></Box>
        <PresenceTransition visible={this.state.updatedfriendo} initial={{
      opacity: 0,
      scale: 0
    }} animate={{
      opacity: 1,
      scale: 1,
      transition: {
        duration: 250
      }
    }}>
          <Box alignSelf="center" bg={this.state.requestAction? "success.600" : "error.600"} width="100%" height="80%" justifyContent='center' alignContent={'center'} ><Text fontSize="l" color="light.900" textAlign="center" bold>{this.state.requestAction? 'Added ':'Removed request from' } {this.state.friendName}</Text></Box>
        </PresenceTransition>
        <ScrollView>
          {this.props.numReq === 0? <VStack alignSelf={'center'}><Text fontSize="l" color="light.900" textAlign="center" bold>No Friend Requests...</Text><Ionicons name='ear' style={{'fontSize':128}} color='DarkBlue'></Ionicons></VStack>: <></>}
         {this.props.isLoading === false?<FlatList data={this.props.friendData} renderItem={this.renderRequest} keyExtractor={item => item.user_id} contentContainerStyle={{ flexGrow: 1 }} /> : <Spinner alignSelf={'center'} color={'darkBlue.900'} size={'lg'}/>}
        </ScrollView>

      </NativeBaseProvider>
    );
  }

}

export default FriendRequests;
