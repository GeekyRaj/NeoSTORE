import React from 'react';
import { View,Image,AsyncStorage, } from 'react-native';

class SplashScreen extends React.Component {
  performTimeConsumingTask = async() => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        2000
      )
    )
  }

  async componentDidMount() {
    const data = await this.performTimeConsumingTask();
    if (data !== null) {
      this.CheckIfAlreadyLogin()
    }
  }

  async CheckIfAlreadyLogin() {
    const email = await AsyncStorage.getItem("@user_at");
    //const pass = await AsyncStorage.getItem("@user_pass");
    if (email != null) {
        console.log('SPLASH: User data already exist ' + email);
        this.props.navigation.navigate('Dashboard');
    }
    else{
      this.props.navigation.navigate('App');
    }
}

  render() {
    return (
      <View style={styles.viewStyles}>
        {/* <Text style={styles.textStyles}>
          NeoSTORE
        </Text> */}
        {/* <Image source={require("../images/NeoStore.png")} style={{height:150, width:150,}} /> */}
        <Image source={require("../images/HomeLoader.gif")} style={{height:200, width:300,}} />
       </View>
    );
  }
}

const styles = {
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  textStyles: {
    color: '#E91C1A',
    fontSize: 40,
    fontWeight: 'bold'
  }
}

export default SplashScreen;