import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
 } from 'react-native';
 import Icon from '@expo/vector-icons/Ionicons';
 import StarRating from '../components/StarRating';
import API from '../components/API';

 export default class Sofas extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Sofas',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft:
        (<Icon
          style={{ paddingLeft: 16, color: '#ffffff' }}
          onPress={() => navigation.navigate('Dashboard')}
          name="md-arrow-back"
          size={30}
        />),
    };
  };

      constructor(props){
        super(props);
        this.state ={ isLoading: true}
      }
    
      componentDidMount(){
        const url ='products/getList?product_category_id=3';
        return API(url,null,null)
          .then((responseJson) => {
    
            this.setState({
              isLoading: false,
              dataSource: responseJson.data,
            }, function(){
    
            });
    
          })
          .catch((error) =>{
            console.error(error);
          });
      }
    render(){

        if(this.state.isLoading){
            return(
              <View style={{flex: 1, padding: 20}}>
                <ActivityIndicator/>
              </View>
            )
          }

        return(
            
            <View style={{flex: 1, paddingTop:20}}>
                <FlatList
                data={this.state.dataSource}
                renderItem={({item}) =>{
                    const ratingObj = {
                      ratings: item.rating,
                      views: item.view_count
                    }
                    return <TouchableOpacity key={item.name} onPress={() => this.props.navigation.navigate('ProductDetail',{ pname:item.name, pid:item.id })}>
                        <View style={{flex:1,flexDirection:'row'}}>
                            <Image 
                                style={{ height: 90, width: 90,margin:10, }}
                                source={{uri:item.product_images}} />
                    
                            <View style={{flexDirection:'column', margin:15,}}>
                                <Text style={{fontSize: 20,}}>{item.name}</Text>
                                <Text>{item.producer}</Text>
                                <View style={{flexDirection:'row',}}>
                                    <Text style={{marginTop:5,marginRight:100,color:'red',fontSize:20}}>Rs. {item.cost}</Text>
                                    <StarRating ratingObj={ratingObj}/>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: 360, height: 1, backgroundColor: 'gray',marginLeft:5,  }}></View>
                        </TouchableOpacity>
                }
            }
            keyExtractor={
              (item, index) => index.toString()
            }
                />
            </View>
        )
    }
}