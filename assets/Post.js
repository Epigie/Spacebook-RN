import React, { Component } from 'react';
import {NativeBaseProvider, Box,  HStack, Avatar, Pressable,  VStack, IconButton, Menu, HamburgerIcon,  Text} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment-timezone';

class Post extends Component{
    constructor(props){
      super(props);
      this.state = {
        isliked: false, //This is actually useless due to the API not being able to tell the client whether a user has liked a post without first either liking or deleting the like.
        postID: this.props.postID,
        text: this.props.text,
        time: moment(this.props.timeStamp).tz('Europe/London').format('hh:mm A'),
        date: moment(this.props.timeStamp).tz('Europe/London').format('MM/DD/YYYY'),
        userID: this.props.userID,
        fName: this.props.fName,
        lName: this.props.lName,
        likes: this.props.likes,
        wallID: this.props.wallID
      }
      this.setUp();
    }
  
  
    deletePost = async() => {
      fetch('http://localhost:3333/api/1.0.0/user/'+this.state.wallID+'/post/'+this.state.postID, {
        method: 'DELETE',
        headers: {
          'X-Authorization' : this.state.AuthToken,
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code === 200){
          this.props.RefreshFlatList();
        }
        else{
          if(code === 403){
              this.props.uhOhError('You do not have permission to delete this Post!');
          }
          else{
            this.props.uhOhError('Something went wrong deleting the post')
          }
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
    updatePostData = async() => {
      fetch('http://localhost:3333/api/1.0.0/user/'+this.state.wallID+'/post/'+this.state.postID, {
        method: 'GET',
        headers: {
          'X-Authorization' : this.state.AuthToken,
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code === 200){
          const jsonbody = await response.json();
          const postID = jsonbody.post_id;
          const text = jsonbody.text;
          const timeStamp = jsonbody.timestamp;
          const time = moment(Date(timeStamp)).format('hh:mm');
          const date = moment(Date(timeStamp)).format('MM/DD/YYYY');
          const userID = jsonbody.author.user_id;
          const fName = jsonbody.author.first_name;
          const lName = jsonbody.author.last_name;
          const likes = jsonbody.numLikes;
          this.setState({postID: postID, text : text, date: date, time : time, userID : userID, fName: fName, lName : lName, likes : likes})
        }
        else{
          if(code === 403){
            this.props.uhOhError('You do not have permission to view this Post!');
          }
          else{
            this.props.uhOhError('Something has gone wrong viewing the post?');
          }
        }
      })
      .catch((error) =>{
        console.error(error);
      })
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
  
  
    //Like Functions 
    deleteLike = async () => {
      fetch('http://localhost:3333/api/1.0.0/user/'+this.state.wallID+'/post/'+this.state.postID+'/like', {
        method: 'DELETE',
        headers: {
          'X-Authorization' : this.state.AuthToken,
          'Content-Type' : '*'
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code === 200){
          this.setState({isLiked : false, likes: this.state.likes-1});
        }
        else{
          this.props.uhOhError('Something has gone wrong removing the like,  was it even liked? Are you on your own wall?');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
    likePost = async () =>{
      fetch('http://localhost:3333/api/1.0.0/user/'+this.state.wallID+'/post/'+this.state.postID+'/like', {
        method: 'POST',
        headers: {
          'X-Authorization' : this.state.AuthToken,
          'Content-Type' : '*'
        }
      })
      .then( async (response) => {
        const code = response.status
        if(code === 200){
          this.setState({isliked : true, likes: this.state.likes+1});
        }
        if(code === 403 || code === 400){
          await this.deleteLike();
        }
        else{
          this.props.uhOhError('Something has gone wrong liking the post! Are you logged in???');
        }
      })
      .catch((error) =>{
        console.error(error);
      })
    }
  
    //Focus Checks
  
    setUp = async () => {
      const id = await AsyncStorage.getItem('@USERID');
      const token = await AsyncStorage.getItem('@AUTHTOKEN');
      const ownPost = this.state.userID == id
      this.setState({id : id, AuthToken : token, ownPost: ownPost});
      this.retrieveProfilePicture();
    }
  
    render(){
      return(
        <Box borderBottomWidth='2' borderColor='darkBlue.600' >
          <HStack justifyContent='flex-start'>
            <Box justifyContent='center' marginLeft={3} paddingTop={2} paddingBottom={2}>
            <Avatar size='xl' source={{
              uri: this.state.ProfilePicture
            }} borderWidth='2' borderColor='darkBlue.600' />
            </Box>
            <VStack width='30%'>
              <Text ml={5} color='dark.50' fontSize='xl' bold>{this.state.fName} {this.state.lName}</Text>
              <Text ml={5} fontSize='m' color='dark.100'>{this.state.text}</Text>
              {this.state.ownPost != true ? <IconButton mt={'auto'} alignSelf={'center'} mb={2} onPress={() => this.likePost() } icon={<Ionicons name={this.state.isliked == false ? 'heart-outline' : 'heart'} color='red' />}/> : <></>}
              </VStack>
              <VStack justifyContent='space-evenly' mt={'auto'} mb={2} marginLeft='auto' marginRight={10} alignItems={'center'}>
                  {this.state.ownPost == true? <Menu placement='left' trigger={triggerProps => {
                  return <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                          <HamburgerIcon />
                        </Pressable>;
                }}>
                    <Menu.Item backgroundColor='darkBlue.600' color='light.100' onPress={() => this.props.openModel(true, this.state.postID)}>Edit Post</Menu.Item>
                    <Menu.Item backgroundColor='red.600' color='red.50' onPress={() => this.deletePost()}>Delete Post</Menu.Item>
                </Menu>: <></> }
                
                <Text  color='dark.50'>{this.state.time}</Text>
                <Text  color='dark.50'>{this.state.date}</Text>
                <Text color='red.700' bold>{this.state.likes} Likes</Text>
            </VStack>
  
          </HStack>
  
  
        </Box>
      );
    }
  }

export default Post;