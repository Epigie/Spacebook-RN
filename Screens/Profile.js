import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Button, Avatar, Pressable, TextArea, FlatList, Text, ScrollView, Modal, AlertDialog} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import Post from '../assets/Post.js'


class Profile extends Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
      pagination : 0,
      errorOpen: false,
      refresh : false,
      showEdit: false,
      editPost: null,
      showPMenu: false,
      newPic : null
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
    console.warn('RFL has been called!')
    this.setState({refresh : !this.state.refresh, showEdit: false});
    window.location.reload(false)
  }

  //Error Handling

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
}

  //Modal Function for child components

  openEdit = (value, post) => {
    console.log('opening model');
    this.setState({showEdit : value, editPost: post});
  }

  getPhoto = async () => {
    let Pic = await DocumentPicker.getDocumentAsync({type: 'image/*'})
    if (Pic.type === 'cancel'){
      return
    }
    const res = await fetch(Pic.uri);
    const blob = await res.blob();
    this.setState({newPic : Pic.uri, picBlob: blob, picType : Pic.mimeType })
    console.log('file is: \n'+ Pic.uri);
  }

  uploadPhoto = async (photoblob, picType) => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.state.id+'/photo/', {
      method: 'POST',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'Content-Type' : picType
      },
      body: photoblob
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        console.log("Success")
        this.setState({newPic : null, picBlob: null});
        window.location.reload(false);
      }
      else{
        this.uhOhError('Something has gone wrong uploading the new profile picture.');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
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
        this.uhOhError('Something has gone wrong grabbing the users profile picture.');
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
        this.uhOhError('Something has gone wrong grabbing the users profile info.');
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
        console.log('Post Worked!')
      }
      else{
        if(code === 403){
          this.uhOhError('You do not have permission to post this wall');
        }
        else{
          this.uhOhError('Something has gone wrong posting to the wall!');
        }
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  patchPostData = async (id,text_input) => {
    fetch('http://localhost:3333/api/1.0.0/user/'+id+'/post/'+this.state.editPost,{
      method: 'PATCH',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({text : text_input})
    })
    .then( async (response) =>{
      const code = response.status
      if(code === 200){
        this.RefreshFlatList();
      }
      else{
        this.uhOhError('Something went wrong patching the post!!')
      }
    })
    .catch((error) => {
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
          this.uhOhError('You do not have permission to view this wall');
        }
        else{
          this.uhOhError('Something has gone wrong viewing the wall!');
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
    return(<Post postID={item.post_id} text={item.text} timeStamp={item.timestamp} userID={item.author.user_id} fName={item.author.first_name} lName={item.author.last_name} likes={item.numLikes} navigation={this.props.navigation} AuthToken={this.state.AuthToken} RefreshFlatList={this.RefreshFlatList} openModel={this.openEdit} wallID={this.state.id} uhOhError={this.uhOhError}/>);
  }

  


  //Render Function
   render(){
    return (
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
        <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%" justifyContent='center'><Heading size="xl" color="light.100" textAlign="left" ml='2'>Your Profile</Heading></Box>
        {console.log(this.state.last_name)}
        <Heading alignSelf='center' color='light.900'>{this.state.First_name != null ? this.state.First_name: 'Unknown, Are you logged in?'} {this.state.Last_name != null ? this.state.Last_name: ''}</Heading>
        <Center alignSelf='center' alignItems='center' mt='2' width='50%'>
          <Pressable onPress={() => this.setState({showPMenu : true})}><Avatar borderWidth='2' borderColor='darkBlue.900'source={{uri: this.state.ProfilePicture,}} size="2xl" resizeMode="center" /></Pressable>
          <Modal isOpen={this.state.showPMenu} onClose={() => this.setState({showPMenu: false})}>
            <Modal.Content maxWidth='400px'>
                <Modal.CloseButton />
                <Modal.Header>Upload New Profile Picture</Modal.Header>
                <Modal.Body>
                  {this.state.newPic !== null ? <Avatar borderWidth='2' borderColor='darkBlue.900'source={{uri: this.state.newPic,}} size="xl" resizeMode="center" alignSelf={'center'} marginBottom='5' /> :<></>}
                  <Button onPress={() => this.getPhoto()} colorScheme='darkBlue' leftIcon={<Ionicons name='folder' color='white'/>}>Open..</Button>
                  {this.state.newPic !== null ? <Button onPress={() => this.uploadPhoto(this.state.picBlob, this.state.picType)} w='40%' marginTop='5' marginLeft={'auto'} colorScheme='red' leftIcon={<Ionicons name='cloud-upload-outline'/>} >Upload</Button>: <></>}
                </Modal.Body>
              </Modal.Content>
            </Modal>
          <Text alignSelf='center'>Email: {this.state.Email != null ? this.state.Email : 'Unknown'}</Text>
          <TextArea borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='What`s on your mind?' w={{
            base: '100%'
          }} onChangeText={(value) => this.setState({post: value})} ></TextArea>
          <Button colorScheme='darkBlue' mt='5' alignSelf='flex-end' onPress={() => this.postToWall(this.state.id)} >Post</Button>
        </Center>
        <Box width='100%' borderBottomWidth='2' borderColor='darkBlue.600'>
          <Heading color='dark.50' bold ml='5' >Your Wall</Heading>
        </Box>
        <Modal isOpen={this.state.showEdit} onClose={() => this.openEdit(false,null)}>
          <Modal.Content maxWidth='400px'>
            <Modal.CloseButton/>
            <Modal.Header>Edit Post</Modal.Header>
            <Modal.Body>
            <TextArea borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='What`s on your mind?' w={{
            base: "100%"
          }} onChangeText={(value) => this.setState({post: value})} ></TextArea>
          <Button mt='5' alignSelf='flex-end' onPress={() => this.patchPostData(this.state.id,this.state.post)} >Done</Button>
            </Modal.Body>
          </Modal.Content>
          </Modal>
        <ScrollView width='100%'>
          <FlatList extraData={this.state} data={this.state.postData} renderItem={this.renderPost} keyExtractor={item => item.post_id} />
        </ScrollView>
      </NativeBaseProvider>
      
    );
  }
}

export default Profile;
