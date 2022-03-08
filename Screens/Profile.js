import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Button, HStack, Avatar, Pressable, TextArea, VStack, IconButton, Menu, HamburgerIcon, FlatList, Text, ScrollView} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment-timezone';

class Post extends Component{
  constructor(props){
    super(props);
    this.state = {
      isliked: null, //This is actually useless due to the API not being able to tell the client whether a user has liked a post without first either liking or deleting the like.
      ownPost: this.props.id === this.props.userID ? true : false ,
      postID: this.props.postID,
      text: this.props.text,
      time: moment(this.props.timeStamp).tz('Europe/London').format('hh:MM A'),
      date: moment(this.props.timeStamp).tz('Europe/London').format('MM/DD/YYYY'),
      userID: this.props.userID,
      fName: this.props.fName,
      lName: this.props.lName,
      likes: this.props.likes
    }
    this.setUp();
  }

  patchPostData = async (text_input) => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.props.id+'/post'+this.state.userID,{
      method: 'PATCH',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      },
      body: JSON.stringify({text : text_input})
    })
    .then( async (response) =>{
      const code = response.status
      if(code === 200){
        this.updatePostData();
      }
      else{
        throw('Something went wrong patching the post!!')
      }
    })
    .catch((error) => {
      console.error(error);
    })
  }

  updatePostData = async() => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.state.userID+'/post'+this.state.postID, {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        const jsonbody = await response.json();
        console.log(jsonbody)
        const postID = jsonbody.post_id;
        const text = jsonbody.text;
        const timeStamp = jsonbody.timestamp;
        const time = moment(Date(timeStamp)).format('hh:MM');
        const date = moment(Date(timeStamp)).format('MM/DD/YYYY');
        const userID = jsonbody.author.user_id;
        const fName = jsonbody.author.first_name;
        const lName = jsonbody.author.last_name;
        const likes = jsonbody.numLikes;
        this.setState({postID: postID, text : text, date: date, time : time, userID : userID, fName: fName, lName : lName, likes : likes})
        //this.props.RefreshFlatList();
      }
      else{
        if(code === 403){
          throw('You do not have permission to view to this Post!');
        }
        else{
          throw('Something has gone wrong viewing the post?');
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
      console.log(response);
      if(code === 200){
        const blob = await response.blob();
        const base64image = URL.createObjectURL(blob);
        this.setState({ProfilePicture : base64image});
      }
      else{
        throw('Something has gone wrong grabbing the users profile picture.');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }


  //Like Functions 
  deleteLike = async () => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.props.id+'/post/'+this.state.postID+'/like', {
      method: 'DELETE',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'Content-Type' : '*'
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        this.setState({isLiked : false});
        this.props.RefreshFlatList();
      }
      else{
        throw('Something has gone wrong removing the like,  was it even liked?');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  likePost = async () =>{
    fetch('http://localhost:3333/api/1.0.0/user/'+this.props.id+'/post/'+this.state.postID+'/like', {
      method: 'POST',
      headers: {
        'X-Authorization' : this.props.AuthToken,
        'Content-Type' : '*'
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        this.setState({isLiked : true});
        this.props.RefreshFlatList();
      }
      if(code === 403){
        await this.deleteLike();
      }
      else{
        throw('Something has gone wrong liking the post! Are you logged in???');
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
    this.setState({id : id, AuthToken : token});
    this.retrieveProfilePicture();
  }

  render(){
    return(
      <Box borderBottomWidth='2' borderColor='darkBlue.600' >
        <HStack space={3} justifyContent='flex-start'>
          <Box justifyContent='center' marginLeft={3} paddingTop={2} paddingBottom={2}>
          <Avatar size='xl' source={{
            uri: this.state.ProfilePicture
          }} borderWidth='2' borderColor='darkBlue.600' />
          </Box>
          <VStack width='30%'>
            <Text color='dark.50' fontSize='xl' bold>{this.state.fName} {this.state.lName}</Text>
            <Text fontSize='m' color='dark.100'>{this.state.text}</Text>
            <HStack space={2} justifyContent='space-evenly'>
              <IconButton onPress={() => console.log('lol') } icon={<Ionicons name="heart-outline" color='red.700' />}></IconButton>
              <Text color='red.700' bold>{this.state.likes}</Text>
            </HStack>
            </VStack>
            <VStack  marginLeft='auto' alignItems={'center'}>
              <Menu w="190" placement='left' trigger={triggerProps => {
                return <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                        <HamburgerIcon />
                      </Pressable>;
              }}>
                  <Menu.Item>Edit Post</Menu.Item>
                  <Menu.Item backgroundColor='red.600' color='red.50'>Delete Post</Menu.Item>
              </Menu>
              <Text  color='dark.50'>{this.state.time}</Text>
              <Text  color='dark.50'>{this.state.date}</Text>
          </VStack>

        </HStack>


      </Box>
    );
  }
}


class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      pagination : 0,
      refresh : false
    }
  }

  //Intiial Storage Function

  storeValues = async () =>{
    const id = await AsyncStorage.getItem('@USERID');
    const token = await AsyncStorage.getItem('@AUTHTOKEN');
    this.setState({id : id, AuthToken : token});
  }

  //Refresh Function

  RefreshFlatList = () => {
    this.setState({refresh : !this.state.refresh});
  }

  //Retriever Functions

  retrieveProfilePicture = () =>{
    fetch('http://localhost:3333/api/1.0.0/user/'+this.state.id+'/photo/', {
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
        throw('Something has gone wrong grabbing the users profile picture.');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  retrieveInfo = () => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.state.id, {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        const jsonbody = await response.json()
        const fName = jsonbody.first_name;
        const lName = jsonbody.last_name;
        const email = jsonbody.email;
        const friends = jsonbody.friend_count;
        this.setState({First_name : fName, Last_name: lName, Email : email, Friend_Count : friends });
      }
      else{
        throw('Something has gone wrong grabbing the users profile info.');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  //Post Functions
  postToWall = async (id) => {
    const post = this.state.post;
    fetch('http://localhost:3333/api/1.0.0/user/'+id+'/post', {
      method: 'POST',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({text : this.state.post})
    })
    .then( async (response) => {
      const code = response.status
      if(code === 201){
        this.setState({post: null})
        window.location.reload(false)
        //this.forceUpdate();
        console.log('Post Worked!')
      }
      else{
        if(code === 403){
          throw('You do not have permission to post to this wall');
        }
        else{
          throw('Something has gone wrong posting to the wall!');
        }
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  retrievePosts = async (id, offset) => {
    fetch('http://localhost:3333/api/1.0.0/user/'+id+'/post?limit=20&offset='+offset, {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        const jsonbody = await response.json();
        this.setState({postData : jsonbody})
      }
      else{
        if(code === 403){
          throw('You do not have permission to view to this wall');
        }
        else{
          throw('Something has gone wrong viewing the wall!');
        }
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  //Nav Focus functions
  checkFocus = async () => {
    const value = await AsyncStorage.getItem('@AUTHTOKEN');
    if (value != null) {
      await this.storeValues();
      this.retrieveProfilePicture();
      this.retrieveInfo();
      this.retrievePosts(this.state.id,this.state.offset);
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

  renderPost = ({item}) => {
    return(<Post postID={item.post_id} text={item.text} timeStamp={item.timestamp} userID={item.author.user_id} fName={item.author.first_name} lName={item.author.last_name} likes={item.numLikes} navigation={this.props.navigation} AuthToken={this.state.AuthToken} RefreshFlatList={this.RefreshFlatList}/>);
  }

  


  //Render Function
   render(){
    return (
      <NativeBaseProvider>
        <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%" justifyContent='center'><Heading size="xl" color="light.100" textAlign="left" ml='2'>Your Profile</Heading></Box>
        {console.log(this.state.last_name)}
        <Heading alignSelf='center' color="light.900">{this.state.First_name != null ? this.state.First_name: 'Unknown, Are you logged in?'} {this.state.Last_name != null ? this.state.Last_name: ''}</Heading>
        <Center alignSelf='center' alignItems='center' mt='2' width='50%'>
          <Pressable onPress={() => console.log("Hello from Avatar!")}><Avatar borderWidth='2' borderColor='darkBlue.900'source={{uri: this.state.ProfilePicture,}} size="2xl" resizeMode="center" /></Pressable>
          <Text alignSelf='center'>Email: {this.state.Email != null ? this.state.Email : 'Unknown'}</Text>
          <TextArea borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='What`s on your mind?' w={{
            base: "100%"
          }} onChangeText={(value) => this.setState({post: value})} ></TextArea>
          <Button mt='5' alignSelf='flex-end' onPress={() => this.postToWall(this.state.id)} >Post</Button>
        </Center>
        <Box width='100%' borderBottomWidth='2' borderColor='darkBlue.600'>
          <Heading color='dark.50' bold ml='5' >Your Wall</Heading>
        </Box>
        <ScrollView width='100%'>
        {/* <Post postID={13} text={'Reload'} timeStamp={'"2022-03-07T19:26:19.000Z"'} userID={10} fName={'Test'} lName={'User'} likes={0} navigation={this.props.navigation} AuthToken={this.state.AuthToken}/> */}
          <FlatList extraData={this.state.refresh} data={this.state.postData} renderItem={this.renderPost} keyExtractor={item => item.post_id} contentContainerStyle={{
    flexGrow: 1,
    }} />
        </ScrollView>
      </NativeBaseProvider>
      
    );
  }
}

export default Profile;
