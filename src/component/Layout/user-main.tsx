import React from 'react'
import { Flex, View } from '@adobe/react-spectrum'
import { Route, Routes } from 'react-router-dom'
import logo from '../../logo.svg';
import SignInForm from 'pages/user/sigin';
import SignUpForm from 'pages/user/sigup';

const UserMain = () => {

	return (
		<Routes>
			<Route path="/" element={<ShowFirstPage />} />
			<Route path="/auth/login" element={<SignInForm />} />
			<Route path="/auth/register" element={<SignUpForm />} />
		</Routes>
	);
}


const ShowFirstPage = () => (<Flex direction={"column"} alignItems={"center"} justifyContent={"center"}>
	<View marginY='size-400'>
		<img src={logo} width={'256px'} className="App-logo" alt="logo" />
	</View>
	<View>SPRS</View>
</Flex>)

export default UserMain;