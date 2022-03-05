import React from 'react'
import { Flex } from '@adobe/react-spectrum'
import { Route, Routes } from 'react-router-dom'
import logo from '../logo.svg';

const Merk = React.lazy(()=> import('./Merk'))
const Wheel = React.lazy(()=> import('./Wheel'));
const Vehicle = React.lazy(()=> import('./Vehicle'))
const Branch = React.lazy(()=> import('./Branch'));
const Warehouse = React.lazy(()=> import('./Warehouse'));
const Finance = React.lazy(()=> import('./Finance'));

const Order = React.lazy(()=> import('../Order'))


const Main = () => {
  return (
    <Routes>
      <Route path="/" element={<ShowFirstPage />} />
      <Route path="/merk" element={<React.Suspense fallback={<div>Please wait...</div>}>
        <Merk /></React.Suspense>} />
      <Route path="/wheel" element={
      <React.Suspense fallback={<div>Please wait...</div>}><Wheel /></React.Suspense>} />
      <Route path="/vehicle" element={
      <React.Suspense fallback={<div>Please wait...</div>}>
      <Vehicle /></React.Suspense>} />
      <Route path="/branch" element={<React.Suspense fallback={<div>Please wait...</div>}>
        <Branch /></React.Suspense>} />
      <Route path="/warehouse" element={
      <React.Suspense fallback={<div>Please wait...</div>}><Warehouse /></React.Suspense>} />
      <Route path="/finance" element={
      <React.Suspense fallback={<div>Please wait...</div>}><Finance /></React.Suspense>} />
      <Route path="/order" element={
        <React.Suspense fallback={<div>Please wait...</div>}><Order /></React.Suspense>
      } />
    </Routes>
  );
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