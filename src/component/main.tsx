import React from 'react'
import { Flex } from '@adobe/react-spectrum'
import { Route, Routes } from 'react-router-dom'
import logo from '../logo.svg';

import Merk from './Merk'
import Wheel from './Wheel'
import Vehicle from './Vehicle'

const Main = () => {
    return (
        <Routes>
            <Route path="/" element={<ShowFirstPage />}/>
            <Route path="/merk" element={<Merk />} />
            <Route path="/wheel" element={<Wheel />} />
            <Route path="/vehicle" element={<Vehicle />} />
        </Routes>
    )
}

function ShowFirstPage() {
    return (
      <Flex direction={"column"} alignItems={"center"} justifyContent={"center"} maxWidth={640}>
        <img src={logo} className="App-logo" alt="logo" />
        <div className="sip">SPRS</div>
      </Flex>
    )
  }
  
  
export default Main;