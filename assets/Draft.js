import { TextArea, Text, HStack, VStack, Popover, IconButton, Pressable, Tooltip, Box } from "native-base";
import { Component } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment-timezone';
import DateTimePicker from 'react-datetime-picker';


class Draft extends Component {
    constructor(props){
        super(props)
        this.state = {
            editPost: false,
            postID: this.props.id,
            postText: this.props.text,
            datetime: this.props.datetime,
            AuthToken: this.props.AuthToken,
            userID: this.props.userID 

        }
    }


    postToWall = async (userID,AuthToken,postText,postID) => {
        fetch('http://localhost:3333/api/1.0.0/user/'+userID+'/post', {
          method: 'POST',
          headers: {
            'X-Authorization' : AuthToken,
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({text : postText})
        })
        .then( async (response) => {
          const code = response.status
          if(code === 201){
            this.setState({newPost: null, schedulePostDate : null})
            this.props.deleteDraft(postID)


          }
          else{
            if(code === 403){
              this.props.uhOhError('You do not have permission to post this wall');
            }
            else{
              this.props.uhOhError('Something has gone wrong posting to the wall!');
            }
          }
        })
        .catch((error) =>{
          console.error(error);
        })
      }

    render(){
        return(
            <Box borderBottomWidth='2' borderColor='darkBlue.600' >
                <HStack alignItems={'center'} mt='2'>
                    {this.state.editPost == false? <Tooltip label='Click to edit draft'>< Pressable onPress={()=>{this.setState({editPost:true})}}><Text>{this.state.postText}</Text></Pressable></Tooltip> :<TextArea ref={input => { this.editBox = input }} borderColor='darkBlue.900' borderWidth='2' placeholder='What`s on your mind?' onChangeText={(value) => this.setState({newPost: value})} InputRightElement={<VStack><IconButton onPress={()=>{this.setState({editPost:false,newPost:null})}} icon={<Ionicons name={'close-circle'} color='red' size='medium'/>} /><IconButton onPress={()=>{this.props.editDraft(this.state.postID,this.state.datetime,this.state.newPost); this.setState({editPost:false,newPost:null})}} icon={<Ionicons name={'checkmark-circle'} color='green' size='medium'/>} /></VStack>} />}
                    <VStack alignItems={'center'} justifyContent='center' marginLeft={'auto'} marginRight={5} >
                        {this.state.datetime !='None'? <VStack justifyContent={'center'} alignItems={'center'}><Text fontSize={'xs'} color='dark.50'>{moment(Date(this.state.datetime)).format('hh:mm')}</Text><Text fontSize={'xs'} color='dark.50'>{moment(Date(this.state.datetime)).format('MM/DD/YYYY')}</Text></VStack>:<></>}
                        
                        <HStack justifyItems={'center'} alignItems={'center'}>
                            <Popover trigger={triggerProps => {
                                return <IconButton {...triggerProps} icon={<Ionicons name={'time'} color='darkblue' size='large' />} />;
                                    }} >
                                    <Popover.Content accessibilityLabel="Schedule Post" w="56" style={{'overflow': 'show'}}>
                                    <Popover.Arrow />
                                    <Popover.CloseButton />
                                    <Popover.Header>Schedule Post</Popover.Header>
                                    <Popover.Body>
                                        <DateTimePicker onChange={(value) => {this.setState({datetime : value})}} />
                                    </Popover.Body>
                                    </Popover.Content>
                                </Popover>
                                <Tooltip label='Post draft'>
                                    <IconButton onPress={() => {this.postToWall(this.state.userID,this.state.AuthToken,this.state.postText,this.state.postID)}} icon={<Ionicons name={'checkmark-circle'} color='darkblue' size='large'/>} />
                                    </Tooltip>
                                <Tooltip label='Delete draft'>
                                    <IconButton onPress={() => {this.props.deleteDraft(this.state.postID)}} icon={<Ionicons name={'close-circle'} color='darkblue' size='large'/>} />
                                    </Tooltip>
                            </HStack>
                        </VStack>
                    </HStack>
            </Box>
        );
    }
}

export default Draft;