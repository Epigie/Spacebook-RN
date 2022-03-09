import React, { Component } from 'react';
import {NativeBaseProvider, Box, Heading, Button, HStack, Avatar, TextArea, VStack, Spinner, FlatList, Text, ScrollView, Modal, Input, AlertDialog} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Result from '../assets/Result.js';
import Post from '../assets/Post.js';



class Search extends Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
    this.state = {
     value : null,
     errorOpen: false,
     errorDialog: '',
     isLoading : false,
     results: null,
     showUser: false,
     modalUserID: null,
     modalUserInfo : null,
     modalUserPicture : null
    }
  }

    //Error Handling

    uhOhError = (error) =>{
      this.setState({errorOpen : true, errorDialog: error})
      throw(error);
  }

  searchPeople = async (search) => {
    this.setState({isLoading : true})
    fetch('http://localhost:3333/api/1.0.0/search?='+encodeURIComponent(search), {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'accept': 'application/json',
      }
    })
    .then( async (response) => {
      const code = response.status
      console.log(response);
      if(code === 200){
        console.log('searched')
        const jsonbody = await response.json();
        console.log(jsonbody)
        this.setState({results : jsonbody}, () => this.setState({isLoading: false}));
      }
      else{
        this.uhOhError('Something has gone wrong grabbing the users friends.');
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
        this.setState({postData : jsonbody}, () => {if(this.state.postData != null){
          this.setState({showUser : true, modalUserID : id})
        }
        else{
          this.uhOhError('You are not friends!')
        }})
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

  showUserModal = (userID, pictureblob) => {
    fetch('http://localhost:3333/api/1.0.0/user/'+userID, {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      const code = response.status
      if(code === 200){
        const jsonbody = await response.json()
        this.setState({modalUserInfo: jsonbody, modalUserPicture: pictureblob });
        await this.retrievePosts(userID, 0);
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
    const post = this.state.postText;
    fetch('http://localhost:3333/api/1.0.0/user/'+id+'/post', {
      method: 'POST',
      headers: {
        'X-Authorization' : this.state.AuthToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({text : post})
    })
    .then( async (response) => {
      const code = response.status
      if(code === 201){
        this.setState({post: null})
        console.log('Post Worked!')
        await this.retrievePosts(id,0);
      }
      else{
        if(code === 403){
          this.uhOhError('You do not have permission to post to this wall');
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

  closeUserModal = () => {
    this.setState({showUser: false, modalUserID: null, modalUserInfo : null, postData: null})
  }

  getFriends = async () => {
    fetch('http://localhost:3333/api/1.0.0/user/'+this.state.id+'/friends/', {
      method: 'GET',
      headers: {
        'X-Authorization' : this.state.AuthToken,
      }
    })
    .then( async (response) => {
      const code = response.status
      console.log(response);
      if(code === 200){
        let arr = [];
        const jsonbody = await response.json();
        for (let entry in jsonbody) {
          arr.push(jsonbody[entry].user_id)
        }
        console.log('array' + arr);
        this.setState({myFriends : arr});
      }
      else{
        this.uhOhError('Something has gone wrong grabbing the users friends.');
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  //Intiial Storage Function

  storeValues = async () =>{
    const id = await AsyncStorage.getItem('@USERID');
    const token = await AsyncStorage.getItem('@AUTHTOKEN');
    this.setState({id : id, AuthToken : token});
    await this.getFriends();
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

  RefreshFlatList = async () => {
    await this.retrievePosts(this.state.modalUserID);
  }

  renderResult = ({item}) => {
    return(
      <Result userID={item.user_id} fName={item.user_givenname} lName={item.user_familyname} friendArray={this.state.myFriends} showUserModal={this.showUserModal} uhOhError={this.uhOhError} />
    );
  }

  renderPost = ({item}) => {
    return(<Post postID={item.post_id} text={item.text} timeStamp={item.timestamp} userID={item.author.user_id} fName={item.author.first_name} lName={item.author.last_name} likes={item.numLikes} navigation={this.props.navigation} AuthToken={this.state.AuthToken} RefreshFlatList={this.RefreshFlatList} openModel={this.openEdit} wallID={this.state.modalUserID} uhOhError={this.uhOhError} />);
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
        <Modal isOpen={this.state.showUser} onClose={() => this.closeUserModal()} mt={10}>
            <Modal.Content maxWidth='400px' marginBottom={'auto'} mt={0}>
                <Modal.CloseButton />
                <Modal.Header>User Profile</Modal.Header>
                <Modal.Body>
                  {this.state.modalUserInfo !== null? <Heading marginBottom={5} alignSelf={'center'}>{this.state.modalUserInfo.first_name} {this.state.modalUserInfo.last_name}</Heading>: <></>}
                  {this.state.modalUserPicture !== null ? <Avatar borderWidth='2' borderColor='darkBlue.900'source={{uri: this.state.modalUserPicture}} size="xl" resizeMode="center" alignSelf={'center'} marginBottom='5' /> :<></>}
                  {this.state.modalUserInfo !== null? <HStack space={2} alignSelf={'center'} justifyContent={'center'}><Text marginBottom={2} marginTop={5} bold>Email: </Text><Text marginBottom={2} marginTop={5} >{this.state.modalUserInfo.email}</Text></HStack>: <></>}
                  {this.state.modalUserInfo !== null? <TextArea borderColor='darkBlue.900' borderWidth='2' mt='5' placeholder='Houston we have lift off!' w={{base: "100%"}} onChangeText={(value) => this.setState({postText: value})} ></TextArea> : <></> }
                  {this.state.modalUserInfo !== null? <Button mt='5' alignSelf='flex-end' onPress={() => this.postToWall(this.state.modalUserID)} >Post</Button>: <></>}
                  {this.state.postData !== null? <Box width='100%' borderBottomWidth='2' borderColor='darkBlue.600'><Heading color='dark.50' bold ml='5' >Your Wall</Heading></Box>: <></>}
                  {this.state.postData !== null? <ScrollView><FlatList extraData={this.state} data={this.state.postData} renderItem={this.renderPost} keyExtractor={item => item.post_id}></FlatList> </ScrollView>:<></>}
                </Modal.Body>
              </Modal.Content>
            </Modal>
      <Box alignSelf="center" bg="darkBlue.900" width="100%" height="10%" justifyContent='center'><Heading size="xl" color="light.100" textAlign="left" ml='2'>Search</Heading></Box>
      <Box alignSelf="center" bg="muted.300" width="100%" height="10%" justifyContent='center' roundedBottom={10} borderBottomWidth={2} borderColor={'darkBlue.600'} alignItems='center'>
          <VStack w='100%' ml={5} justifyContent={'center'} alignItems='center'>
            <Text>Search for a person:</Text>
            <HStack space={2} w='100%' justifyContent={'center'} alignItems='center'>
              <Input borderColor={'darkBlue.900'} borderWidth={2} InputLeftElement={<Ionicons name='search-circle' color='black' size={'xl'}/>} placeholder="One small step for man..."   onChangeText={(value) => this.setState({search: value})} name="Name"/>
              <Button  alignSelf={'bottom'} colorScheme='darkBlue' onPress={() => {this.searchPeople(this.state.search); console.log(this.state.results)}}>Search</Button>
              </HStack>
            </VStack>
        </Box>
      <ScrollView>
        {this.state.isLoading === false? <FlatList extraData={this.state} data={this.state.results} keyExtractor={item => item.user_id} contentContainerStyle={{ flexGrow: 1 }} renderItem={this.renderResult}/>: <Spinner alignSelf={'center'} color={'darkBlue.900'} size={'lg'}/>}
        

      </ScrollView>
    </NativeBaseProvider>
    );
  }
}

export default Search;
