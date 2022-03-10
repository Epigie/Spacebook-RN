import React, { Component } from 'react';
import {NativeBaseProvider, Box, HStack, Avatar, Pressable, IconButton, Text} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';


class Request extends Component {
    constructor(props){
        super(props);
        this.state = {
          userID: this.props.userID,
          fName: this.props.fName,
          lName: this.props.lName,
        }
        this.setUp();
      }

      setUp = async () => {
        const id = await AsyncStorage.getItem('@USERID');
        const token = await AsyncStorage.getItem('@AUTHTOKEN');
        this.setState({id : id, AuthToken : token});
        this.retrieveProfilePicture(this.state.userID);
      }


      acceptFriend = async (userID) =>{
        fetch('http://localhost:3333/api/1.0.0/friendrequests/'+userID, {
          method: 'POST',
          headers: {
            'X-Authorization' : this.state.AuthToken,
          }
        })
        .then( async (response) => {
          const code = response.status
          if(code === 200 || code === 200){
            this.setState({frSent : true}, () => {this.props.friendUpdated(true, this.state.fName+' '+this.state.lName); this.props.refreshRequests()});
          }
          else{
              this.props.uhOhError('Something has gone wrong accepting the friend request!');
          }
        })
        .catch((error) =>{
          console.error(error);
        })
      }

      retrieveProfilePicture = (userID) =>{
        fetch('http://localhost:3333/api/1.0.0/user/'+userID+'/photo/', {
          method: 'GET',
          headers: {
            'X-Authorization' : this.state.AuthToken,
          }
        })
        .then( async (response) => {
          const code = response.status
          if(code === 200){
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

      rejectFriend = async (userID) =>{
        fetch('http://localhost:3333/api/1.0.0/friendrequests/'+userID, {
          method: 'DELETE',
          headers: {
            'X-Authorization' : this.state.AuthToken,
          }
        })
        .then( async (response) => {
          const code = response.status
          if(code === 200 || code === 200){
            this.setState({frSent : false}, () => {this.props.friendUpdated(false, this.state.fName+' '+this.state.lName); this.props.refreshRequests()});
          }
          else{
              this.props.uhOhError('Something has gone wrong rejecting the friend request!');
          }
        })
        .catch((error) =>{
          console.error(error);
        })
      }

    render(){
        return(
            <Box borderTopWidth={2} borderTopColor='darkBlue.600' borderBottomWidth='2' borderBottomColor='darkBlue.600' alignSelf={'center'} width={'70%'} borderLeftWidth={'2'} borderRightWidth={'2'} borderLeftColor='gray' borderRightColor={'gray'} justifyContent={'center'}>
          <HStack space={3}  alignItems={'center'}>
              <Avatar ml={5} size='xl' source={{
              uri: this.state.ProfilePicture
            }} borderWidth='2' borderColor='darkBlue.600' marginTop={2} marginBottom={2} />
            <Text fontSize={'2xl'}>{this.state.fName} {this.state.lName}</Text>
            <HStack space={2} alignItems={'center'} marginLeft={'auto'} marginRight={5}>
                <IconButton ml={'auto'} size={'lg'} onPress={() => this.acceptFriend(this.state.userID)}  icon={<Ionicons name={'person-add'} color='DarkBlue' />} />
                <IconButton ml={'auto'} size={'lg'} onPress={() => this.rejectFriend(this.state.userID)}  icon={<Ionicons name={'person-remove'} color='red' />} />
            </HStack>
          </HStack>
        </Box>
        );
    }
}

export default Request;