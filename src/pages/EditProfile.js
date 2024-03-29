import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Image,
    AsyncStorage,
} from 'react-native';
import ProfileImage from '../components/ProfileImage';
import DatePicker from 'react-native-datepicker';
import Icon from '@expo/vector-icons/Ionicons';
import { ImagePicker, Permissions, Constants } from 'expo';
import API from '../components/API';
import CartContext from '../context/CartContext';
import style from '../Styles';
console.reportErrorsAsExceptions= false;

export default class EditProfile extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Profile',
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

    constructor() {
        super();
        this.state = {
            dataSource: [],
            token: '',
            fname: '',
            lname: '',
            email: '',
            pno: '',
            date: "15-05-2000",
            errmsg: ' ',
            error: 0,
            //ShowErrorBorder var Validate
            fnameVal: true,
            lnameVal: true,
            emailVal: true,
            pnoVal: true,
            image: null,
        }
        this.GetUserData();
    }

    GetUserData = async () => {
        try {
            this.setState({
                token: await AsyncStorage.getItem('@user_at'),
                fname: await AsyncStorage.getItem('@user_fname'),
                lname: await AsyncStorage.getItem('@user_lname'),
                email: await AsyncStorage.getItem('@user_email'),
                pno: await AsyncStorage.getItem('@user_phoneno'),
                date: await AsyncStorage.getItem('@user_dob'),
            })
            console.log('In MyAccount')
        } catch (e) {
            console.log(e);
        }
        console.log('Value Retrieved for user :' + this.state.fname + ' ' + this.state.token);
    }

    updateValue(text, field) {
        alph = /^[a-zA-Z]+$/;
        mailreg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        passreg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        phonereg = /^\d{3}\d{3}\d{4}$/;

        if (field == 'fname') {
            if (alph.test(text)) {
                this.setState({
                    fname: text,
                    fnameVal: true,
                    error: 0,
                })
            }
            else {
                console.log('inavlid First name');
                this.setState({ errmsg: 'Enter Only alphabets for First Name !', error: 1, fnameVal: false, })
            }

        }
        else if (field == 'lname') {
            if (alph.test(text)) {
                this.setState({
                    lname: text,
                    lnameVal: true,
                    error: 0,
                })
            }
            else {
                console.log('inavlid last name');
                this.setState({ errmsg: 'Enter Only alphabets for last Name !', error: 1, lnameVal: false, })
            }
        }
        else if (field == 'email') {
            if (mailreg.test(text)) {
                this.setState({
                    email: text,
                    emailVal: true,
                    error: 0,
                })
            }
            else {
                console.log('inavlid Email ID');
                this.setState({ errmsg: 'Enter valid email address !', error: 1, emailVal: false, })
            }
        }
        else if (field == 'pno') {
            if (phonereg.test(text)) {
                this.setState({
                    pno: text,
                    pnoVal: true,
                    error: 0,
                })
            }
            else {
                console.log('Inavlid Phone Number');
                this.setState({ errmsg: 'Enter 10 digit Contact Number!', error: 1, pnoVal: false, })
            }
        }
    }

    onPressButton = (ContextVal) => {
        if (this.state.error == 0) {
            this.setState({ TextInputEnable: false })
            //& update the data in api
            this.updateUser(ContextVal);
        }
        else {
            alert(this.state.errmsg);
        }
    }

    async updateUser(ContextVal) {
        const first_name = this.state.fname;
        const last_name = this.state.lname;
        const email = this.state.email;
        const phone_no = this.state.pno;
        const dob = this.state.date;
        const profpic = this.state.image;
        console.log('Profilepic :'+profpic);


        const method = "POST";
        const url = "users/update";
        const body = `first_name=${first_name}&last_name=${last_name}&email=${email}&dob=${dob}&profile_pic=${profpic}&phone_no=${phone_no}`
        //console.log(body)
        return API(url, method, body)
            .then(responseJson => {
                this.setState({ dataSource: responseJson }, function () { })
                this.isSuccessfull(); 
                ContextVal.getUpdate();
            })
            .catch(error => {
                console.error(error);
            });
    }

    isSuccessfull() {
        const { navigate } = this.props.navigation;
        if (this.state.dataSource.status == 200) {

            setTimeout(function () {
                navigate("MyAccount");
            }, 2000);
            alert("" + this.state.dataSource.user_msg);
        } else if (this.state.dataSource.status == 401) {
            alert("" + this.state.dataSource.user_msg);
        } else if (this.state.dataSource.status == 400) {
            alert("" + this.state.dataSource.user_msg);
        } else {
            alert("Something Went Wrong");
        }
    }

    UpdateProfilePath() {
        alert('Image clicked');
    }

    componentDidMount() {
        this.getPermissionAsync();
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }

    _pickImage = async () => {
        let image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            base64: true,
            aspect: [4, 3],
        });
        //console.log('in picker ' + image.base64);
        if (!image.cancelled) {
             this.setState({ image: 'data:image/jpeg;base64,' + image.base64 });
        }
        //console.log('\nImage path : ' + this.state.image);
    };

    render() {
        let { image } = this.state;
        return (
            <View style={styles.container}>

                <View style={styles.imgView}>
                    <TouchableOpacity onPress={() => this._pickImage()}>
                        <ProfileImage/>
                        {image &&
                            <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                    </TouchableOpacity>
                </View>
                <View style={[style.SectionStyle, !this.state.fnameVal ? style.error : null]}>
                    <Icon style={style.Expoicon} name="md-person" size={25} />
                    <TextInput
                        style={style.inputBox}
                        placeholder="First Name"
                        placeholderTextColor='#ffffff'
                        defaultValue={this.state.fname}
                        onChangeText={(text) => this.updateValue(text, 'fname')}
                    />
                </View>
                <View style={[style.SectionStyle, !this.state.lnameVal ? style.error : null]}>
                    <Icon style={style.Expoicon} name="md-person" size={25} />
                    <TextInput
                        style={style.inputBox}
                        placeholder="Last Name"
                        placeholderTextColor='#ffffff'
                        defaultValue={this.state.lname}
                        onChangeText={(text) => this.updateValue(text, 'lname')}
                    />
                </View>
                <View style={[style.SectionStyle, !this.state.emailVal ? style.error : null]}>
                    <Icon style={style.Expoicon} name="md-mail" size={25} />
                    <TextInput
                        style={style.inputBox}
                        placeholder="Email"
                        placeholderTextColor='#ffffff'
                        defaultValue={this.state.email}
                        onChangeText={(text) => this.updateValue(text, 'email')}
                        keyboardType="email-address"
                    />
                </View>
                <View style={[style.SectionStyle, !this.state.pnoVal ? style.error : null]}>
                    <Icon style={style.Expoicon} name="md-call" size={25} />
                    <TextInput
                        style={style.inputBox}
                        placeholder="Phone Number"
                        placeholderTextColor='#ffffff'
                        defaultValue={this.state.pno}
                        onChangeText={(text) => this.updateValue(text, 'pno')}
                        keyboardType="number-pad"
                    />
                </View>
                <View style={style.SectionStyle}>

                    <DatePicker
                        style={{ width: 270, borderColor: null, borderRadius: 15 }}
                        date={this.state.date} //initial date from state
                        mode="date" //The enum of date, datetime and time
                        placeholder="D.O.B"
                        format="DD-MM-YYYY"
                        minDate="01-01-1980"
                        maxDate="01-01-2019"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                            dateIcon: {
                                position: 'absolute',
                                left: 0,
                                top: 4,
                                marginLeft: 0
                            },
                            dateInput: {
                                marginLeft: 36
                            }
                        }}
                        onDateChange={(date) => { this.setState({ date: date }) }}
                    />
                </View>
                <CartContext.Consumer>
                    {ContextVal => (
                        <TouchableOpacity style={styles.button}
                            onPress={() => {
                                this.onPressButton(ContextVal);

                            }}  >
                            <Text style={styles.Textbutton}>Edit Profile</Text>
                        </TouchableOpacity>
                    )}
                </CartContext.Consumer>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        //marginVertical:10,
        paddingTop: 20,
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#e91c1a"
    },
    inputBox: {
        width: 250,
        //backgroundColor: 'rgba(255,255,255,0.3)',
        //borderRadius: 25,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 16,
        color: '#ffffff',
        marginVertical: 5,
    },
    img: {
        paddingTop: 15,
        height: 130,
        width: 130,
        borderRadius: 65,
        margin: 10,
    },
    imgIcon: {
        height: 15,
        width: 15,
    },
    SectionStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        height: 40,
        margin: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 25,
    },
    Textbutton: {
        fontSize: 18,
        fontWeight: '500',
        color: '#E91c1a',
        textAlign: 'center',
    },
    button: {
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 10,
    },
    error: {
        borderWidth: 2,
        borderColor: 'orange',
    }
});