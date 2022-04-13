import React from "react";
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import User from '@spectrum-icons/workflow/User';
import UserProfile from '@spectrum-icons/workflow/RealTimeCustomerProfile';
import LogOut from '@spectrum-icons/workflow/LogOut';
import AssetsLinkedPublished from "@spectrum-icons/workflow/AssetsLinkedPublished";
import { defaultTheme, Provider } from '@adobe/react-spectrum';
//import { Footer } from "@react-spectrum/view";

import Aside from "../sides";
import Main from "../main";
import useAuthService from "lib/auth-service";
import { ActionButton, Item, Menu, MenuTrigger, Text } from "@adobe/react-spectrum";
import Group from "@spectrum-icons/workflow/Group";
import Type from "@spectrum-icons/workflow/ClassicGridView";
import Code from "@spectrum-icons/workflow/Code";
import Book from "@spectrum-icons/workflow/Book";
import Money from "@spectrum-icons/workflow/Money";
import NamingOrder from "@spectrum-icons/workflow/NamingOrder";
import ModernGridView from "@spectrum-icons/workflow/ModernGridView";
import JourneyReports from "@spectrum-icons/workflow/JourneyReports";
import ColorWheel from "@spectrum-icons/workflow/ColorWheel";
import Car from "@spectrum-icons/workflow/Car";
import BranchCircle from "@spectrum-icons/workflow/BranchCircle";
import Building from "@spectrum-icons/workflow/Building";
import Branch2 from "@spectrum-icons/workflow/Branch2";
import Demographic from "@spectrum-icons/workflow/Demographic";
import DividePath from "@spectrum-icons/workflow/DividePath";

// type LayoutProps = {
//   children: React.ReactNode;
// };

export const siteTitle = "SPRS";

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
        columns={{ base: ["3fr"], L: ["1fr", "4fr"] }}
        rows={["size-800", "auto", "size-1000"]}
        minHeight={"100vh"}
      >

        <View gridArea={'header'}>
          <Provider theme={defaultTheme} colorScheme="dark">
            <Flex  direction={'row'} height={{ base: 'size-800', M: 'size-800' }} flex columnGap={{ base: "size-50", M: "size-400" }} alignItems={'center'}>
              <View marginStart={{base:'size-50',M:'size-400'}}>
                <AssetsLinkedPublished size={'L'} justifySelf='center' alignSelf={'center'} />
              </View>
              <View flex>
                {/* <View height={'size-800'} isHidden={{ base: true, M: false }}>
                <div className="spectrum-Heading spectrum-Heading--sizeL">SPRS</div> */}
                {/* <View><span className={'h2-orange font-bold font-title'}>PT. SARANA PADMA RIDHO SEPUH</span></View>
                <View>GENERAL SUPPLIER, CONTRACTOR, COLLECTION</View>
                <View>Jl. Gator Subroto Villa Gatsu No. 01 - Indramayu</View> */}
                {/* </View> */}
                <View margin={'size-50'} isHidden={{ base: true, M: false }}><span className={"div-h2 text-white font-bold"}>SPRS</span></View>
              </View>
              <View marginEnd={{base:'size-50',M:'size-400'}}>
                  <MenuMaster />
                  <MenuCoa />
                  <MenuReport />
                  <MenuUser />
              </View>
            </Flex>
          </Provider>
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

const MenuUser = () => {
  const navigate = useNavigate();
  const auth = useAuthService();
  const user = auth.getCurrentUser();
  const items = [
    { id: "logout", name: "Logout " + (user && user.userName), icon: <LogOut />, action: logOut },
    { id: "profile", name: "Profile", icon: <User />, action: gotoProfile }
  ]

  return (<MenuTrigger>
    <ActionButton isQuiet><UserProfile /><Text>{user && user.userName}</Text></ActionButton>
    <Menu
      items={items}
      onAction={(e) => items.filter(f => f.id === e)[0].action()}>
      {item => <Item key={item.id} textValue={item.name}>
        {item.icon}
        <Text>{item.name}</Text></Item>}
    </Menu>
  </MenuTrigger>)

  function logOut() {
    auth.logout();
    navigate("/")
    window.location.reload();
  }

  function gotoProfile() {
    navigate("/profile")
  }
}

const MenuCoa = () => {
  const navigate = useNavigate()

  const items = [
    { id: 'group', name: 'Group Akun', icon: <Group /> },
    { id: 'type', name: 'Tipe Akun', icon: <Type /> },
    { id: 'code', name: 'Kode Akun', icon: <Code /> }
  ];

  return <MenuTrigger>
    <ActionButton isQuiet><Book /><Text>COA</Text></ActionButton>
    <Menu items={items} onAction={(e) => {
      navigate("/acc-" + e)
    }}>
      {item => <Item key={item.id} textValue={item.name}>
        {item.icon}
        <Text>{item.name}</Text></Item>}
    </Menu>
  </MenuTrigger>
}


const MenuReport = () => {
  const navigate = useNavigate()

  const items = [
    { id: 'saldo', name: 'Saldo (Group Akun)', icon: <ModernGridView />, link: `/report/trx/${new Date().getMonth() + 1}/${new Date().getFullYear()}` },
    { id: 'status', name: 'Status Order', icon: <NamingOrder />, link: `/report/order-status/${new Date().getMonth() + 1}/${new Date().getFullYear()}/0/0/0/-/-` },
    { id: 'money', name: 'Laporan Keuangan', icon: <Money />, link: "/labarugi" }
  ];

  return <MenuTrigger>
    <ActionButton isQuiet><JourneyReports /><Text>Laporan</Text></ActionButton>
    <Menu items={items} onAction={(e) => {
      navigate(items.filter(f => f.id === e)[0].link)
    }}>
      {item => <Item key={item.id} textValue={item.name}>
        {item.icon}
        <Text>{item.name}</Text></Item>}
    </Menu>
  </MenuTrigger>
}



const MenuMaster = () => {
  const navigate = useNavigate()

  const items = [
    { id: 'wheel', name: 'Jenis Roda', icon: <ColorWheel /> },
    { id: 'merk', name: 'Merk Kendaraan', icon: <Branch2 /> },
    { id: 'vehicle', name: 'Tipe Kendaraan', icon: <Car /> },
    { id: 'branch', name: 'Cabang Kantor', icon: <BranchCircle /> },
    { id: 'warehouse', name: 'Gudang', icon: <Building /> },
    { id: 'finance', name: 'Badan Finance', icon: <Demographic /> }
  ];

  return <MenuTrigger>
    <ActionButton isQuiet><DividePath /><Text>Master</Text></ActionButton>
    <Menu items={items} onAction={(e) => {
      navigate("/" + e)
    }}>
      {item => <Item key={item.id} textValue={item.name}>
        {item.icon}
        <Text>{item.name}</Text></Item>}
    </Menu>
  </MenuTrigger>
}