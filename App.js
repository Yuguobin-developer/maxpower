import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import {
  ActivityIndicator, Text, View, StyleSheet, Button,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './navigation/DrawerNavigator'
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ConfirmSignUp from './screens/ConfirmSignUp';
import Home from './screens/Home';
import configureStore from './state/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as RnpProver } from 'react-native-paper'
import { Provider } from 'react-redux';
import { withLocalize } from "react-localize-redux";
import globalTranslations from "./global_translations.json";

const auth_info = {
  'default': {
    identityPoolId: 'us-west-2:fb1d35f0-f28a-498e-9613-3f2e1d0413b8',
    region: 'us-west-2',
    identityPoolRegion: 'us-west-2',
    userPoolId: 'us-west-2_Egs1O9oFP',
    userPoolWebClientId: '625gsocja09lctnsrlfp1up2n1',
    mandatorySignIn: true
  },
  'prod': {
    identityPoolId: 'us-west-2:324b24c9-5b5a-41df-996e-07ba5af46ba5',
    region: 'us-west-2',
    identityPoolRegion: 'us-west-2',
    userPoolId: 'us-west-2_3bOPtD4Bc',
    userPoolWebClientId: '15264rog6ah36k0qpk5p8pr6dl',
    mandatorySignIn: false
  }
}

Amplify.configure({
  Auth: auth_info['default'],
  Analytics: { disabled: true },
});

const AuthenticationStack = createStackNavigator();
const AppStack = createStackNavigator();

const AuthenticationNavigator = props => {
  return (
    <AuthenticationStack.Navigator headerMode="none">
      <AuthenticationStack.Screen name="SignIn">
        {screenProps => (
          <SignIn {...screenProps} updateAuthState={props.updateAuthState} />
        )}
      </AuthenticationStack.Screen>
      <AuthenticationStack.Screen name="SignUp" component={SignUp} />
      <AuthenticationStack.Screen
        name="ConfirmSignUp"
        component={ConfirmSignUp}
      />
    </AuthenticationStack.Navigator>
  );
};


const Initializing = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="tomato" />
    </View>
  );
};

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback
    onPress={() => Keyboard.dismiss()}
    style={{ flex: 1 }}
  >
    {children}
  </TouchableWithoutFeedback>
);

function App() {
  const [isUserLoggedIn, setUserLoggedIn] = useState('initializing');

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      await Auth.currentAuthenticatedUser();
      console.log(' User is signed in');
      setUserLoggedIn('loggedIn');
    } catch (err) {
      console.log(' User is not signed in');
      setUserLoggedIn('loggedOut');
    }
  }

  function updateAuthState(isUserLoggedIn) {
    setUserLoggedIn(isUserLoggedIn);
  }

  async function signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  }

  const { store, persistor } = configureStore();

  return (
    <RnpProver>
      <Provider store={store}>
        <DismissKeyboard>
          <NavigationContainer>
            <StatusBar style="dark" />
            {isUserLoggedIn === 'initializing' && <Initializing />}
            {isUserLoggedIn === 'loggedIn' && (
              <DrawerNavigator updateAuthState={updateAuthState} />
            )}
            {isUserLoggedIn === 'loggedOut' && (
              <AuthenticationNavigator updateAuthState={updateAuthState} />
            )}
          </NavigationContainer>
        </DismissKeyboard>
      </Provider>
    </RnpProver>
  );
}

export default withLocalize(App)
