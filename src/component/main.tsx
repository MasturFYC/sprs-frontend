import React from 'react'
import { Flex } from '@adobe/react-spectrum'
import { Route, Routes } from 'react-router-dom'
import logo from '../logo.svg';

const Merk = React.lazy(() => import('./Merk'))
const Wheel = React.lazy(() => import('./Wheel'));
const Vehicle = React.lazy(() => import('./Vehicle'))
const Branch = React.lazy(() => import('./Branch'));
const Warehouse = React.lazy(() => import('./Warehouse'));
const Finance = React.lazy(() => import('./Finance'));

const Order = React.lazy(() => import('../Order'));
const OrderPage = React.lazy(() => import('../Order/OrderPage'));
const Invoice = React.lazy(() => import('../Invoice'));
const InvoiceForm = React.lazy(() => import('../Invoice/InvoiceForm'));
const AccType = React.lazy(() => import('./acc-type'));
const AccCode = React.lazy(() => import('./acc-code'));
const TrxType = React.lazy(() => import('./acc-group'));
const Trx = React.lazy(() => import('./trx'));
const TrxAutoDebet = React.lazy(() => import('./trx-auto-debet'));

const ReportTrxtByMonth = React.lazy(() => import('../Report/ReportTrxByMonth'));
const ReportOrder = React.lazy(() => import('../Report/ReportOrder'));
const LoanPage = React.lazy(() => import('../pages/loan'));
const LoanListPage = React.lazy(() => import('../pages/loan/loan-list'));
const PageForm = React.lazy(() => import('../pages/loan/form'));

const Main = () => {
  return (
    <Routes>
      <Route path="/" element={<ShowFirstPage />} />
      <Route path="/merk" element={
        <React.Suspense fallback={<div>Please wait...</div>}>
          <Merk />
        </React.Suspense>
      } />
      <Route path="/wheel" element={<React.Suspense fallback={<div>Please wait...</div>}><Wheel /></React.Suspense>} />
      <Route path="/vehicle" element={<React.Suspense fallback={<div>Please wait...</div>}><Vehicle /></React.Suspense>} />
      <Route path="/branch" element={<React.Suspense fallback={<div>Please wait...</div>}><Branch /></React.Suspense>} />
      <Route path="/warehouse" element={<React.Suspense fallback={<div>Please wait...</div>}><Warehouse /></React.Suspense>} />
      <Route path="/finance" element={<React.Suspense fallback={<div>Please wait...</div>}><Finance /></React.Suspense>} />
      <Route path="/order">
        <Route path=':pid' element={<React.Suspense fallback={<div>Please wait...</div>}><OrderPage /></React.Suspense>} />
        <Route path=':s/:p' element={<React.Suspense fallback={<div>Please wait...</div>}><Order /></React.Suspense>} />
      </Route>
      <Route path="/invoice">
        <Route path='list' element={<React.Suspense fallback={<div>Please wait...</div>}><Invoice /></React.Suspense>} />
        <Route path=":financeId/:invoiceId" element={<React.Suspense fallback={<div>Please wait...</div>}><InvoiceForm /></React.Suspense>} />
      </Route>
      <Route path="/loan" element={<React.Suspense fallback={<div>Please wait...</div>}><LoanPage /></React.Suspense>}>
        <Route path="list" element={<React.Suspense fallback={<div>Please wait...</div>}><LoanListPage /></React.Suspense>} />        
        <Route path=":pid" element={<React.Suspense fallback={<div>Please wait...</div>}><PageForm /></React.Suspense>} />        
      </Route>
      <Route path="/acc-type" element={<React.Suspense fallback={<div>Please wait...</div>}><AccType /></React.Suspense>}>
        <Route path=":id/:name" element={<React.Suspense fallback={<div>Please wait...</div>}><AccType /></React.Suspense>} />
      </Route>
      <Route path="/acc-code" element={<React.Suspense fallback={<div>Please wait...</div>}><AccCode /></React.Suspense>}>
        <Route path=":id/:name" element={<React.Suspense fallback={<div>Please wait...</div>}><AccCode /></React.Suspense>} />
      </Route>
      <Route path="/acc-group" element={<React.Suspense fallback={<div>Please wait...</div>}><TrxType /></React.Suspense>} />
      <Route path="/trx" element={<React.Suspense fallback={<div>Please wait...</div>}><Trx /></React.Suspense>}><Route path=":trxId" element={<Trx />} />
      </Route>
      <Route path="/trx-auto-debet">
        <Route path=":trxId" element={
          <React.Suspense fallback={<div>Please wait...</div>}>
            <TrxAutoDebet />
          </React.Suspense>} />
      </Route>
      <Route path="/report">
        <Route path="trx">
          <Route path=":m/:y" element={
            <React.Suspense fallback={<div>Please wait...</div>}>
              <ReportTrxtByMonth />
            </React.Suspense>} />
        </Route>
        <Route path="order-status" element={<React.Suspense fallback={<div>Please wait...</div>}><ReportOrder /></React.Suspense>}>
          <Route path=":m/:y/:f/:b/:t/:tf/:to" element={<React.Suspense fallback={<div>Please wait...</div>}><ReportOrder /></React.Suspense>} />
        </Route>
      </Route>
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