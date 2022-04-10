import React from 'react';
import './App.css';
import useAuthService from 'lib/auth-service';
import Layout from './component/layout';
import logo from './logo.svg';
import { Flex } from '@react-spectrum/layout';
import { View } from '@react-spectrum/view';


function App() {
  const auth = useAuthService();
  const user = auth.getCurrentUser();

  return (
    user && user.accessToken ?
    <Layout />
    :
      <Flex direction={"column"} alignItems={"center"} justifyContent={"center"} minHeight={"100vh"}>
        <img src={logo} className="App-logo" alt="logo" />
        <View maxWidth={640}>SPRS</View>
      </Flex>
  );
}

export default App;
