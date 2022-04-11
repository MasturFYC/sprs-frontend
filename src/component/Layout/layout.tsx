import React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
//import { Footer } from "@react-spectrum/view";

import Aside from "../sides";
import Main from "../main";
import useAuthService from "lib/auth-service";
import { ActionButton, Item, Menu, MenuTrigger, Text } from "@adobe/react-spectrum";
import UserLock from '../../user.svg';
import logo from '../../logo.svg';

// type LayoutProps = {
//   children: React.ReactNode;
// };

export const siteTitle = "SPRS";

const Layout = () => {
  //const navigate = useNavigate()

  const auth = useAuthService();
  const user = auth.getCurrentUser();

  // let titleStyle = {
  //   fontSize: "110%",
  //   fontWeight: 700,
  //   lineHeight: "100%",
  //   textDecoration: 'none',
  //   color: "Highlight"
  // };

  return (
    <Router>
      <Grid
        areas={{
          base: ["header header", "content content", "footer footer"],
          M: ["header  sidebar", "content content", "footer  footer"],
          L: ["header  header", "sidebar content", "footer  footer"],
        }}
        columns={{ base: ["3fr"], L: ["1fr", "4fr"] }}
        rows={["size-1250", "auto", "size-1000"]}
        minHeight={"100vh"}
      >
        <View
          gridArea="header"
          backgroundColor={"gray-100"}
          borderBottomWidth={"thin"}
          borderBottomColor={"gray-200"}
          paddingX={{ base: "size-50", M: "size-200" }}
        >
          <Flex direction={'row'} columnGap={"size-100"} alignItems={'center'} justifyContent={'center'}>
            <View isHidden={{ base: true, L: false }} width={{ base: 64, M: 90 }}>
              <img src={logo} alt="logo" style={{ width: "32px" }} />
            </View>
            <View>
              <View><span className={'h2-orange font-bold font-title'}>PT. SARANA PADMA RIDHO SEPUH</span></View>
              <View>GENERAL SUPPLIER, CONTRACTOR, COLLECTION</View>
              <View>Jl. Gator Subroto Villa Gatsu No. 01 - Indramayu</View>
            </View>
            <View flex>
              <View justifySelf={'self-end'}>
                <MenuTrigger>
                  <ActionButton><UserLock /><Text>{user && user.userName}</Text></ActionButton>
                  <Menu onAction={(e) => {
                    if (e === 'logout') {
                      auth.logout();
                      window.location.reload();
                    }
                  }}>
                    <Item key='logout' textValue={`Logout ${user && user.userName}`}><span className={'text-no-wrap'}>Logout {user && user.userName}</span></Item>
                    <Item key='profile' textValue={'Profile'}>Profile</Item>
                  </Menu>
                </MenuTrigger>
              </View>
            </View>
          </Flex>
        </View>
        <View
          isHidden={{ base: true, L: false }}
          gridArea="sidebar"
          backgroundColor={"gray-100"}
          paddingY={"size-50"}
          borderEndWidth={{ base: "thin", L: undefined }}
          borderEndColor={"gray-200"}
        >
          <Aside />
        </View>

        <View gridArea="content" backgroundColor="gray-75" height={"100%"}>
          <View paddingX={{ base: "size-75", M: "size-400", L: "size-600" }} marginTop={"size-200"} marginBottom={"size-200"}>
            <Main />
          </View>
        </View>

        <View gridArea="footer"
          backgroundColor="gray-200"
          flex
          paddingTop={"size-100"}
          paddingX={{ base: "size-75", M: "size-400" }}
        >
          <span className="footer-copy">&copy; FYC 2021. All rights reserved.</span>
        </View>
      </Grid>
    </Router>
  );
};


export default Layout;