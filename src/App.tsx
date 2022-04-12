import React from 'react';
import './App.css';
import useAuthService, { User } from 'lib/auth-service';
//import autHeader from 'lib/auth-header';
import Layout from 'component/Layout/layout';
import UserLayout from 'component/Layout/user-layout';
import axios from 'lib/axios-base';

function App() {
  const auth = useAuthService();
  const user = auth.getCurrentUser();
  
  React.useEffect(() => {
    let isLoaded = true;

    async function checkExpire() {
      //const header = autHeader();
      return await axios.post("/auth/check")
        .then(response => response.data)
        .catch(err => err)
        .then(data=>data);
    }

    checkExpire().then(data => {
      if (isLoaded) {
        //console.log("TEST")
        if (data.message === 'Ok') {
          const u = localStorage.getItem('user')
          if(u) {
            const gu = JSON.parse(u) as User;
            localStorage.setItem("user", JSON.stringify({ ...gu, accessToken: data.accessToken}));
          }
          return;
        }
        localStorage.removeItem("user")
      }
    })
    return () => { isLoaded = false }
  }, [])

  return (
    user && user.accessToken && user.role === 'admin' ?
      <Layout />
      :
      <UserLayout />
  );
}

export default App;
