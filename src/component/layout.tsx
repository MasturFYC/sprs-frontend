import React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Footer } from "@react-spectrum/view";

import logo from '../logo.svg';
import Aside from "./sides";
import Main from "./main";

export const siteTitle = "SPRS";

// type LayoutProps = {
//   children: React.ReactNode;
// };


const Layout = () => {

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
        columns={["1fr", "3fr"]}
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
          <Flex flex direction={"row"} columnGap={{ base: "size-10", M: "size-50" }}>
            <View width={{ base: 64, M: 90 }} alignSelf={"center"}
              flex={{ base: 1, M: 1, L: "none" }} marginTop={{ base: "size-10", L: "size-25" }}>
              <img src={logo} alt="logo" style={{ width: "32px" }} />
            </View>
            <View flex alignSelf={"center"}>
              <View>
                <p>Top Menu</p>
              </View>
            </View>
          </Flex>
        </View>
        <View
          isHidden={{ base: true, L: false }}
          gridArea="sidebar"
          backgroundColor={"gray-100"}
          padding={"size-100"}
          borderEndWidth={{ base: "thin", L: undefined }}
          borderEndColor={"gray-200"}
        >
          <Aside />
        </View>

        <View gridArea="content" backgroundColor="gray-75" height={"100%"}>
          <View paddingX={{ base: "size-75", M: "size-400", L: "size-1200" }} marginTop={"size-200"} marginBottom={"size-200"}>
            <Main />
          </View>
        </View>

        <View gridArea="footer"
          backgroundColor="gray-200"
          flex
          paddingTop={"size-100"}
          paddingX={{ base: "size-75", M: "size-400" }}
        >
          &copy; FYC 2021. All rights reserved.
        </View>
      </Grid>
    </Router>
  );
};


export default Layout;
