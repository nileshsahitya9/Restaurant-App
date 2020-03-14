import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';



const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
   postFavorite: (dishId) => dispatch(postFavorite(dishId)),
   postComment: (dishId, author, rating, comment) => dispatch(postComment(dishId, author, rating, comment))
})
const shareDish = (title, message, url) => {
    Share.share({
        title: title,
        message: title + ': ' + message + ' ' + url,
        url: url
    },{
        dialogTitle: 'Share ' + title
    })
}




function RenderDish(props) {

    const dish = props.dish;
    handleViewRef = ref => this.view = ref;
    
    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -100 )
            return true;    
        else
            return false;
    }
    const recognizeDrag1 = ({ moveX, moveY, dx, dy }) => {
        if ( dx > 100 )
            return true;    
        else
            return false;
    }
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
                else if (recognizeDrag1(gestureState)) {
                    props.toggleModal();
                }
    
            return true;
        }
    })
    
    if (dish != null) {
        return(
          
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
            <Card
            featuredTitle={dish.name}
            image={{uri: baseUrl + dish.image }}>
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
                <View style={styles.container}>
                <Icon
                    style={styles.icon}
                    raised
                    reverse
                    name={ props.favorite ? 'heart' : 'heart-o'}
                    type='font-awesome'
                    color='#f50'
                    onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                    />
                <Icon 
                    style={styles.icon}
                    raised
                    reverse
                    name={'pencil'}
                    type='font-awesome'
                    color='blue'
                    onPress={() => props.toggleModal()}
                    />
                     <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
                </View>
            </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {

        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating 
                        style={styles.rating}
                        imageSize={10}
                        readonly
                        startingValue={item.rating} 
                        />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + item.date}</Text>
            </View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title='Comments'>
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()} />
        </Card>
        </Animatable.View>
    );
}


class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state ={
            rating: 5,
            author: '',
            comment: '',
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Dish Details'
    };


    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }


    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(dishId, author, rating, comment) {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
        this.props.postComment(dishId, author, rating, comment);
        
    }

    handleAuthor(text) {
        this.setState({author: text});
    }

    handleNewComment = (text) => {
        this.setState({comment: text});
    }

    handleRating(rating) {
        this.setState({rating: rating});
    }
    resetForm() {
        this.setState({
            rating: 5,
            author: '',
            comment: '',
            showModal: false
        });
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    toggleModal = {() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onRequestClose = {() => this.toggleModal() } >
                    <View style={styles.modal}> 
                        <Rating
                            type='star'
                            ratingCount={5}
                            defaultRating={5}
                            startingValue={5}
                            showRating
                            onFinishRating={(rating)=> this.setState({rating: rating})}
                            fractions={0}
                        /> 
                        <Input 
                            placeholder='   Author'
                            leftIcon={
                                <Icon
                                name='user-o'
                                type='font-awesome'
                                size={24}
                                color='black'
                                />
                            }
                            onChangeText={text => this.handleAuthor(text)}
            
                            />
                        <Input 
                            placeholder='   Comment'
                            leftIcon={
                                <Icon
                                name='comment-o'
                                type='font-awesome'
                                size={24}
                                color='black'
                                />
                            }
                            onChangeText={text => this.handleNewComment(text)}
                            />
                            </View>
                            <View style={styles.submitButton}>

                        <Button 
                            onPress = {() => {this.handleComment(dishId,this.state.author, this.state.rating, this.state.comment)}}
                            type="solid"
                            color='#512DA8'
                            title='SUBMIT'
                            />
                            </View>
                            <View style={styles.cancelButton}>
                        <Button color='#C0C0C0'
                            onPress = {() => {this.toggleModal(); this.resetForm();}}
                            title='CANCEL'
                            
                            />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        marginBottom: 30
       
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     },
     container: {
         flex: 1,
         flexDirection: 'row',
         justifyContent: 'center'
     },
     submitButton: {
        fontWeight: 'bold',
        margin: 10,
        color: '#512DA8'
     },
     cancelButton: {
        fontWeight: 'bold',
        margin : 10,
        color: '#C0C0C0'
     },
     rating: {
        marginTop: 140,
        marginBottom: 10,
        alignItems: 'flex-start'
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);