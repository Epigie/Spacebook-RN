import React, { Component } from 'react';
import {NativeBaseProvider, Box, HStack, Avatar, Pressable, IconButton, Text} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

class Result extends Component {
    constructor(props){
      super(props);
      this.state = {
        userID: this.props.userID,
        fName: this.props.fName,
        lName: this.props.lName,
        friends : this.areWeFriends(this.props.userID,this.props.friendArray),
        frSent : false,
      }
      this.setUp();
    }
  
    retrieveProfilePicture = () =>{
      fetch('http://localhost:3333/api/1.0.0/user/'+this.state.userID+'/photo/', {
        method: 'GET',
        headers: {
          'X-Authorization' : this.state.AuthToken,
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code == 200){
          const blob = await response.blob();
          const base64image = URL.createObjectURL(blob);
          this.setState({ProfilePicture : base64image});
        }
        else{
          this.props.uhOhError('Something has gone wrong grabbing the users profile picture.');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
    areWeFriends = (myid,friendarray) => {
      if(friendarray.includes(myid)){
        return true
      }
      else{
        return false
      }
    }
  
  
    addFriend = async (userID) =>{
      fetch('http://localhost:3333/api/1.0.0/user/'+userID+'/friends/', {
        method: 'POST',
        headers: {
          'X-Authorization' : this.state.AuthToken,
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code == 201){
          this.setState({frSent : true});
        }
        else{
            this.props.uhOhError('Something has gone wrong adding the friend.');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
    //This is actually useless since the API doesnt let you delete friends, but it bugged me not to implement it
    removeFriend = async (userID) =>{ 
      fetch('http://localhost:3333/api/1.0.0/user/'+userID+'/friends/', {
        method: 'DELETE',
        headers: {
          'X-Authorization' : this.state.AuthToken,
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code == 200){
          this.setState({frSent : false, friends: false});
        }
        else{
            this.props.uhOhError('Something has gone wrong deleting your friend! Please try again.');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
  
    setUp = async () => {
      const id = await AsyncStorage.getItem('@USERID');
      const token = await AsyncStorage.getItem('@AUTHTOKEN');
      const ownPost = this.state.userID == id
      this.setState({id : id, AuthToken : token, ownPost: ownPost});
      this.retrieveProfilePicture();
    }
  
    render() {
      return(
        <Box borderBottomWidth='2' borderBottomColor='darkBlue.600' alignSelf={'center'} width={'70%'} borderLeftWidth={'2'} borderRightWidth={'2'} borderLeftColor='gray' borderRightColor={'gray'} justifyContent={'center'}>
          <HStack space={3}  alignItems={'center'}>
            <Pressable onPress={() => this.props.showUserModal(this.state.userID, this.state.ProfilePicture)}>
              <Avatar ml={5} size='xl' source={{
              uri: this.state.ProfilePicture
            }} borderWidth='2' borderColor='darkBlue.600' marginTop={2} marginBottom={2} />
            </Pressable>
            <Text>{this.state.fName} {this.state.lName}</Text>
            {this.state.frSent == false? <IconButton ml={'auto'} size={'lg'} onPress={() => {this.state.friends == false ? this.addFriend(this.state.userID) : this.removeFriend(this.state.userID)}}  icon={<Ionicons name={this.state.friends == false ? 'person-add' : 'person-remove'} color='DarkBlue' />} />:<Text fontSize={'s'} color='success.600' >Friend Request Sent</Text> }
          </HStack>
  
        </Box>
      );
    }
  }

export default Result;