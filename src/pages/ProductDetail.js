import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    AsyncStorage,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import NumberFormat from 'react-number-format';
import NumericInput from 'react-native-numeric-input';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import StarRating from '../components/StarRating';
import Icon from '@expo/vector-icons/Ionicons';
import API from '../components/API';
import CartContext from '../context/CartContext';

export default class Table extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('pname', 'Product Detail'),
            headerTintColor: '#fff',
            headerLeft:
                (<Icon
                    style={{ paddingLeft: 16, color: '#ffffff' }}
                    onPress={() => navigation.pop()}
                    name="md-arrow-back"
                    size={30}
                />),
            headerRight: null
        };
    };

    //Modal 
    state = {
        isModalVisible: false
    };

    toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    };

    constructor(props) {
        super(props);
        this.state = {
            pid: null,
            rating: [],
            addcart: [],
            dataSource: [],
            productImages: [],
            largeImage: "",
            quantityModalVisible: false,
            ratingModalVisible: false,

            qty: 1,
            qtypress: true,

            Default_Rating: 1,
            //To set the default Star Selected
            Max_Rating: 5,
            //To set the max number of Stars
            isloaded: true,
        };
        this.Star = 'http://aboutreact.com/wp-content/uploads/2018/08/star_filled.png';
        this.Star_With_Border = 'http://aboutreact.com/wp-content/uploads/2018/08/star_corner.png';
    }

    UpdateRating(key) {
        this.setState({ Default_Rating: key });
        //Keeping the Rating Selected in state
    }

    //Add Quantity
    setQuantityModalVisible(visible, ContextVal) {
        this.setState({ quantityModalVisible: visible });
        console.log(this.state.qty);
        if (visible == false) {
            if (this.state.qty >= 1) {
                console.log("YES")
                if (this.state.qtypress == true) {
                    console.log('Clicked Button')
                    this.addToCart(ContextVal);
                }
            }
            else {
                alert('Enter number of quantity.')
            }
        }
    }

    async addToCart(ContextVal) {
        const quantity = this.state.qty;
        const product_id = this.state.pid;
        url = "addToCart";
        method = "POST";
        body = `product_id=${product_id}&quantity=${quantity}`;
        return API(url, method, body)
            .then(responseJson => {
                console.log(responseJson);
                if (responseJson.status == 200) {
                    console.log(responseJson.message);
                    alert(responseJson.message + 'Check My Cart to Confirm / Delete order.');
                    this.props.navigation.navigate('DashboardTabNavigator');
                    //Set Context count value
                    if (ContextVal != null) {
                        ContextVal.state.count = responseJson.total_carts;
                    }
                    console.log('COUNT : ' + responseJson.total_carts);
                    this.setState({ qtypress: false })
                    try {
                        AsyncStorage.setItem('@user_addcart', 'yes');
                        AsyncStorage.setItem('@user_cartcount', '' + responseJson.total_carts);
                    } catch (error) {
                        console.log(error);
                    }
                }
                else {
                    AsyncStorage.setItem('@user_addcart', 'no');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    /*--------User Rating Set----------*/
    setRatingModalVisible(visible) {
        this.setState({ ratingModalVisible: visible });
        console.log('Rating : ', this.state.Default_Rating);
        if (visible == false) {
            if (this.state.Default_Rating != 1) {
                this.setRating();
            }
            else {
                alert('Please provide rating.!')
            }
        }
    }

    setRating() {
        const { navigation } = this.props;
        const user_rating = this.state.Default_Rating;
        const product_id = this.state.pid;
        console.log('Rating : ' + user_rating + '  Product Id:  ' + product_id);

        url = "products/setRating";
        method = "POST";
        body = `product_id=${product_id}&rating=${user_rating}`;
        return API(url, method, body)
            .then(responseJson => {
                this.setState({
                    rating: responseJson.data,
                }, function () {

                });
                if (responseJson.status == 200) {
                    console.log(responseJson.message);
                    alert('Thanks for Rating..!');
                }
                //console.log(responseJson);
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleCloseModal() {
        this.setState({
            quantityModalVisible: false,
            ratingModalVisible: false,
        });
    }

    //Retrieve product details
    componentDidMount() {
        const { navigation } = this.props;
        const pid = navigation.getParam("pid", "1");
        this.setState({ pid: pid });
        console.log("Product ID : ", pid);
        const url = `products/getDetail?product_id=${pid}`;
        return API(url, null, null)
            .then((responseJson) => {
                //console.log(responseJson);
                this.setState({
                    dataSource: responseJson.data,
                    productImages: responseJson.data.product_images,
                    largeImage: responseJson.data.product_images[0].image,
                    isloaded: false,
                })

            })
            .catch((error) => {
                console.error(error);
            });
    }

    renderImages() {
        return this.state.productImages.map(item => {
            return (
                <TouchableOpacity onPress={() => this.setState({ largeImage: item.image })} key={item.image}>
                    <Image style={{ width: wp('20%'), height: wp('20%'), marginTop: 15, margin: 5, borderColor: 'gray', borderWidth: 1 }} source={{ uri: item.image }} />
                </TouchableOpacity>
            );
        });
    }

    renderLargeImage() {
        if (this.state.largeImage.length > 1) {
            return (
                <Image style={{ width: wp('50%'), height: hp('18%'), alignItems: 'center', padding: 50, resizeMode: 'stretch' }}
                    source={{ uri: this.state.largeImage }} />
            )
        }
    }
    AddQty(qty) {
        if (qty > 8) {
            ToastAndroid.show('Quantity cannot be greater then 8. ', ToastAndroid.SHORT);
        }
        else {
            this.setState({ qty: qty })
            console.log('Qty : ' + this.state.qty);
        }
    }


    render() {
        let dimensions = Dimensions.get("window");
        screenW = dimensions.width - 10;
        screenH = dimensions.height - 10;

        let React_Native_Rating_Bar = [];
        //Array to hold the filled or empty Stars
        for (var i = 1; i <= this.state.Max_Rating; i++) {
            React_Native_Rating_Bar.push(
                <TouchableOpacity
                    activeOpacity={0.7}
                    key={i}
                    onPress={this.UpdateRating.bind(this, i)}>
                    <Image
                        style={styles.StarImage}
                        source={
                            i <= this.state.Default_Rating
                                ? { uri: this.Star }
                                : { uri: this.Star_With_Border }
                        }
                    />
                </TouchableOpacity>
            );
        }

        //Setting Product category
        const pcat = this.state.dataSource.product_category_id;
        let pcatval = " ";
        if (pcat == 1) {
            pcatval = "Table";
        }
        else if (pcat == 2) {
            pcatval = "Chair";
        }
        else if (pcat == 3) {
            pcatval = "Sofa";
        }
        else {
            pcatval = "Cupboard";
        }



        //getting rating
        const ratingObj = {
            ratings: this.state.dataSource.rating,
            views: this.state.dataSource.view_count
        }

        if (this.state.isloaded) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require("../images/Loader1.gif")} />
                </View>
            )
        }

        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', backgroundColor: "#e8e4e3" }}>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: "#e8e4e3", width: '100%' }}>
                    <View style={styles.box}>
                        <View style={{ flex: 4 }}>
                            <Text style={{ fontSize: hp('3.2%'), paddingLeft: 20, marginTop: 10, fontWeight: "bold", }}>{this.props.navigation.state.params.pname}</Text>
                            <Text style={{ fontSize: hp('3%'), paddingLeft: 20, }}>Category - {pcatval} </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row', width: '100%', }}>
                            <View style={{ flex: 8 }}>

                                <Text style={{ fontSize: hp('2%'), paddingLeft: 20, marginBottom: 10, }}>{this.state.dataSource.producer}</Text>
                            </View>
                            <View style={{ flex: 4, }}>
                                <StarRating ratingObj={ratingObj} />
                            </View>

                        </View>


                    </View>
                    <View style={styles.boxmid}>
                        <View style={{ flex: 1, flexDirection: 'row', marginTop: 5, marginLeft: 5, }}>
                            <View style={{ flex: 5 }}>
                                <NumberFormat
                                    value={this.state.dataSource.cost}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    prefix={'\u20B9 '}
                                    renderText={
                                        value => <Text style={{ marginTop: 5,marginLeft: 20, color: 'red', fontSize: hp('3%'), fontWeight: 'bold' }}>{value}</Text>}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                
                            </View>
                        </View>

                        <View style={styles.image}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                {this.renderLargeImage()}
                            </View>
                            <View style={{ flex: 0, flexDirection: 'row', alignContent: 'center', paddingLeft: 20 }}>
                                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={true} nestedScrollEnabled>
                                    {this.renderImages()}
                                </ScrollView>

                            </View>
                        </View>

                        <ScrollView scrollEnabled={true}>
                        <View >
                            <Text style={{ marginTop: 5, paddingLeft: 10, color: 'black', fontSize: hp('3%'), fontWeight: "bold", }}> DESCRIPTION</Text>
                            <Text style={{ marginTop: 2, paddingLeft: 10, color: 'black', fontSize: hp('1.9%'), }}> {this.state.dataSource.description}</Text>
                        </View>
                        </ScrollView>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={this.state.quantityModalVisible}
                            onRequestClose={() => { this.setState({ quantityModalVisible: false }) }}
                        >

                            <View style={{ flex: 1 }}>
                                <View style={{ opacity: 0.5, flex: 6, backgroundColor: '#000' }}>
                                    <TouchableOpacity onPress={() => this.setQuantityModalVisible(!this.state.quantityModalVisible, null)} style={{ flex: 1 }} />
                                </View>

                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 400 }}>

                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', paddingTop: 20 }}>{this.state.dataSource.name}</Text>
                                    <View style={{ marginTop: 33 }}>
                                        {this.renderLargeImage()}
                                    </View>
                                    <View style={{ margin: 15, }}>
                                        <NumericInput
                                            initValue={1}
                                            totalWidth={hp('12%')}
                                            totalHeight={hp('5%')}
                                            iconSize={25}
                                            minValue={1}
                                            maxValue={7}
                                            step={1}
                                            valueType='integer'
                                            rounded
                                            textColor='black'
                                            iconStyle={{ color: 'black' }}
                                            rightButtonBackgroundColor='red'
                                            leftButtonBackgroundColor='white'
                                            onChange={value => this.AddQty(value)} />
                                    </View>
                                    <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center' }}>
                                        <CartContext.Consumer>
                                            {ContextVal => (
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: 'red', borderRadius: 8,
                                                        padding: 10,
                                                        width: 176, height: 42,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => {
                                                        this.setQuantityModalVisible(!this.state.quantityModalVisible, ContextVal);
                                                        //ContextVal.onPlus(); 
                                                        this.setState({ qtypress: true })
                                                    }}>
                                                    <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', paddingBottom: 5 }}>SUBMIT</Text>
                                                </TouchableOpacity>
                                            )}
                                        </CartContext.Consumer>

                                    </View>
                                </View>
                            </View>
                        </Modal>


                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={this.state.ratingModalVisible}
                            onRequestClose={() => { this.setState({ ratingModalVisible: false }) }}>

                            <View style={{ flex: 1 }}>
                                <View style={{ opacity: 0.5, flex: 6, backgroundColor: '#000' }}>
                                    <TouchableOpacity onPress={() => this.setRatingModalVisible(!this.state.ratingModalVisible)} style={{ flex: 1 }} />
                                </View>

                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 420 }}>

                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2C2B2B', paddingTop: 20 }}>{this.state.dataSource.name}</Text>
                                    <View style={{ marginTop: 33 }}>
                                        {this.renderLargeImage()}
                                    </View>
                                    {/* Taking Rating from user */}
                                    <View style={styles.childView}>{React_Native_Rating_Bar}</View>
                                    <Text style={styles.textStyle}>
                                        {/*To show the rating selected*/}
                                        {this.state.Default_Rating} / {this.state.Max_Rating}
                                    </Text>


                                    <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: 'red', borderRadius: 8,
                                                padding: 10,
                                                width: screenW / 2, height: 42,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onPress={() => { this.setRatingModalVisible(!this.state.ratingModalVisible); }}>
                                            <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold' }}>RATE NOW</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>



                    </View>
                    <View style={styles.boxend}>
                        <View style={{ flexDirection: 'row', margin: 10, }}>
                            <TouchableOpacity style={styles.button} onPress={() => { this.setQuantityModalVisible(true, null) }}>
                                <Text style={styles.Textbutton}>BUY NOW</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonRate} onPress={() => { this.setRatingModalVisible(true); }}>
                                <Text style={styles.TextbuttonRate}>RATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    box: {
        flex: 2,
        width: '100%',
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    boxmid: {
        flex: 10,
        width: '98%',
        height: 405,
        backgroundColor: '#ffffff',
        borderRadius: 10,

    },
    image: {
        alignItems: "center",
        flex: 4,
    },
    imageThumb: {
        height: 80,
        width: 120,
        margin: 5,
        borderColor: 'black'
    },
    boxend: {
        flex: 2,
        width: '100%',
        height: 60,
        backgroundColor: '#ffffff',
        position: 'absolute',
        bottom: 0,
    },
    button: {
        width: '47%',
        height: '100%',
        backgroundColor: '#e91c1a',
        borderRadius: 10,
    },
    buttonRate: {
        marginLeft: 10,
        width: '47%',
        height: '100%',
        backgroundColor: '#9c908f',
        borderRadius: 10,
        alignContent: "center",
    },
    StarImage: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
    },
    childView: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 30,
    },
    textStyle: {
        textAlign: 'center',
        fontSize: 18,
        color: '#000',
        marginTop: 5,
        marginBottom: 10,
    },
    Textbutton: {
        fontSize: 18,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center',
        paddingVertical: 10,
    },
    TextbuttonRate: {
        fontSize: 18,
        fontWeight: '500',
        color: '#5c5858',
        textAlign: 'center',
        paddingVertical: 10,
    },
})