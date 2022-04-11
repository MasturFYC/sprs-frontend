import React from 'react';
import './App.css';
import useAuthService from 'lib/auth-service';
import Layout from 'component/Layout/layout';
import UserLayout from 'component/Layout/user-layout';


function App() {
  const auth = useAuthService();
  const user = auth.getCurrentUser();
  

  return (
    user && user.accessToken ?
      <Layout />
      :
      <UserLayout />
  );
}

export default App;
