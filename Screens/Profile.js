import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Center, Button, Avatar, Pressable, TextArea, FlatList, Text, ScrollView, Modal, AlertDialog, VStack, HStack, IconButton, Popover, Spinner} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from 'react-datetime-picker';
import * as DocumentPicker from 'expo-document-picker';
import Post from '../assets/Post.js'


class Profile extends Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
      pagination : 0,
      isLoading: false,
      errorOpen: false,
      refresh : false,
      showEdit: false,
      editPost: null,
      showPMenu: false,
      newPic : null,
      showCal: false,
      schedulePostDate: null,
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
    this.setState({showEdit: false, isLoading : true}, () => {this.retrievePosts(this.state.id,this.state.offset); this.setState({isLoading: false})});

  }

  //Error Handling

  uhOhError = (error) =>{
    this.setState({errorOpen : true, errorDialog: error})
    throw(error);
}

  //Modal Function for child components

  openEdit = (value, post) => {
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
    let json;
    if(this.state.schedulePostDate != null){
      const scheduled = await AsyncStorage.getItem('@scheduledPosts')
      console.log(scheduled)
      if (scheduled !== null && scheduled !== undefined){
        const objarr = JSON.parse(scheduled)
        objarr['posts'].push({'date' : this.state.schedulePostDate, 'post' : this.state.post })
        json = JSON.stringify(objarr)
      } else{
        const str = {'posts':[{'date':this.state.schedulePostDate,'post':this.state.post}]}
        //const obj = JSON.parse(str)
        json = JSON.stringify(str)
      }
      await AsyncStorage.setItem('@scheduledPosts', json)
      this.setState({showScheduled:true})

    }else{
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
        this.postBox.clear()
        this.editBox.clear()
        this.setState({post: null, schedulePostDate : null})
        this.retrievePosts(this.state.id,this.state.offset);
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
        this.setState({postData : jsonbody, isLoading: false})
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
      this.setState({isLoading:true})
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

  getNumPost = (val) =>{
    if(val === undefined){
      return 0;
    }
    else{
      const number = Object.keys(val).length;
      return number;
    }
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
            <Modal isOpen={this.state.showScheduled} onClose={() => this.setState({showScheduled: false})}>
            <Modal.Content maxWidth='400px'>
                <Modal.CloseButton />
                <Modal.Header>Your Post has been scheduled</Modal.Header>
                <Modal.Body>
                  <Button onPress={() => this.setState({showScheduled : false})} colorScheme='darkBlue' >Okay</Button>
                </Modal.Body>
              </Modal.Content>
            </Modal>
          <Text alignSelf='center'>Email: {this.state.Email != null ? this.state.Email : 'Unknown'}</Text>
          <TextArea ref={input => { this.postBox = input }} borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='What`s on your mind?' w={{
            base: '100%'
          }} onChangeText={(value) => this.setState({post: value})} ></TextArea>
          <HStack mt='5' alignSelf='flex-end' alignItems={'center'}>
            <Button colorScheme='darkBlue'  onPress={() => {this.postToWall(this.state.id)}} >Post</Button>
            <Popover trigger={triggerProps => {
              return <IconButton {...triggerProps} icon={<Ionicons name={'time'} color='darkblue' size='large' />} />;
                }} >
                <Popover.Content accessibilityLabel="Schedule Post" w="56" style={{'overflow': 'show'}}>
                  <Popover.Arrow />
                  <Popover.CloseButton />
                  <Popover.Header>Schedule Post</Popover.Header>
                  <Popover.Body>
                    <DateTimePicker onChange={(value) => {this.setState({schedulePostDate : value}); console.log(value)}} />
                  </Popover.Body>
                </Popover.Content>
              </Popover>
            </HStack>
        </Center>
        <Box width='100%' borderBottomWidth='2' borderColor='darkBlue.600'>
          <Heading color='dark.50' bold ml='5' >Your Wall</Heading>
        </Box>
        <Modal isOpen={this.state.showEdit} onClose={() => this.openEdit(false,null)}>
          <Modal.Content maxWidth='400px'>
            <Modal.CloseButton/>
            <Modal.Header>Edit Post</Modal.Header>
            <Modal.Body>
            <TextArea ref={input => { this.editBox = input }} borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='What`s on your mind?' w={{
            base: "100%"
          }} onChangeText={(value) => this.setState({post: value})} ></TextArea>
          <Button mt='5' alignSelf='flex-end' onPress={() => this.patchPostData(this.state.id,this.state.post)} >Done</Button>
            </Modal.Body>
          </Modal.Content>
          </Modal>
        <ScrollView width='100%'>
          {this.state.isLoading == false? <FlatList extraData={this.state} data={this.state.postData} renderItem={this.renderPost} keyExtractor={item => item.post_id} /> : <Spinner alignSelf={'center'} color={'darkBlue.900'} size={'lg'}/>}
          {this.getNumPost(this.state.postData) == 0 && <VStack alignSelf={'center'}><Text fontSize="l" color="light.900" textAlign="center" bold>No Posts!</Text><Ionicons name='help' style={{'fontSize':128}} color='DarkBlue'></Ionicons></VStack>}
        </ScrollView>
      </NativeBaseProvider>
      
    );
  }
}

export default Profile;
