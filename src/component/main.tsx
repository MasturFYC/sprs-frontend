import React from 'react'
import { Flex } from '@adobe/react-spectrum'
import { Route, Routes } from 'react-router-dom'
import logo from '../logo.svg';
import WaitMe from './waitme';

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
const LoanPageForm = React.lazy(() => import('../pages/loan/form'));

const LentPage = React.lazy(() => import('../pages/lent'));
const LentListPage = React.lazy(() => import('../pages/lent/LentListPage'));
const LentPageForm = React.lazy(() => import('../pages/lent/form'));

const LabaRugiPage = React.lazy(() => import('../pages/laba-rugi'));
const LabaRugiTanggal = React.lazy(() => import('../pages/laba-rugi/tanggal'));

const Main = () => {
 
  return (
    <Routes>
      <Route path="/" element={<ShowFirstPage />} />
      <Route path="/merk" element={
        <React.Suspense fallback={<WaitMe />}>
          <Merk />
        </React.Suspense>
      } />
      <Route path="/wheel" element={<React.Suspense fallback={<WaitMe />}><Wheel /></React.Suspense>} />
      <Route path="/vehicle" element={<React.Suspense fallback={<WaitMe />}><Vehicle /></React.Suspense>} />
      <Route path="/branch" element={<React.Suspense fallback={<WaitMe />}><Branch /></React.Suspense>} />
      <Route path="/warehouse" element={<React.Suspense fallback={<WaitMe />}><Warehouse /></React.Suspense>} />
      <Route path="/finance" element={<React.Suspense fallback={<WaitMe />}><Finance /></React.Suspense>} />
      <Route path="/order">
        <Route path=':pid' element={<React.Suspense fallback={<WaitMe />}><OrderPage /></React.Suspense>} />
        <Route path=':s/:p' element={<React.Suspense fallback={<WaitMe />}><Order /></React.Suspense>} />
      </Route>
      <Route path="/invoice">
        <Route path='list' element={<React.Suspense fallback={<WaitMe />}><Invoice /></React.Suspense>} />
        <Route path=":financeId/:invoiceId" element={<React.Suspense fallback={<WaitMe />}><InvoiceForm /></React.Suspense>} />
      </Route>
      <Route path="/loan" element={<React.Suspense fallback={<WaitMe />}><LoanPage /></React.Suspense>}>
        <Route path="list" element={<React.Suspense fallback={<WaitMe />}><LoanListPage /></React.Suspense>} />
        <Route path=":pid" element={<React.Suspense fallback={<WaitMe />}><LoanPageForm /></React.Suspense>} />
      </Route>
      <Route path="/lent" element={<React.Suspense fallback={<WaitMe />}><LentPage /></React.Suspense>}>
        <Route path="list" element={<React.Suspense fallback={<WaitMe />}><LentListPage /></React.Suspense>} />        
        <Route path=":pid" element={<React.Suspense fallback={<WaitMe />}><LentPageForm /></React.Suspense>} />        
      </Route>
      <Route path="/acc-type" element={<React.Suspense fallback={<WaitMe />}><AccType /></React.Suspense>}>
        <Route path=":id/:name" element={<React.Suspense fallback={<WaitMe />}><AccType /></React.Suspense>} />
      </Route>
      <Route path="/acc-code" element={<React.Suspense fallback={<WaitMe />}><AccCode /></React.Suspense>}>
        <Route path=":id/:name" element={<React.Suspense fallback={<WaitMe />}><AccCode /></React.Suspense>} />
      </Route>
      <Route path="/acc-group" element={<React.Suspense fallback={<WaitMe />}><TrxType /></React.Suspense>} />
      <Route path="/trx" element={<React.Suspense fallback={<WaitMe />}><Trx /></React.Suspense>}><Route path=":trxId" element={<Trx />} />
      </Route>
      <Route path="/trx-auto-debet">
        <Route path=":trxId" element={
          <React.Suspense fallback={<WaitMe />}>
            <TrxAutoDebet />
          </React.Suspense>} />
      </Route>
      <Route path="/report">
        <Route path="trx">
          <Route path=":m/:y" element={
            <React.Suspense fallback={<WaitMe />}>
              <ReportTrxtByMonth />
            </React.Suspense>} />
        </Route>
        <Route path="order-status" element={<React.Suspense fallback={<WaitMe />}><ReportOrder /></React.Suspense>}>
          <Route path=":m/:y/:f/:b/:t/:tf/:to" element={<React.Suspense fallback={<WaitMe />}><ReportOrder /></React.Suspense>} />
        </Route>
      </Route>
      <Route path="/labarugi" element={<React.Suspense fallback={<WaitMe />}><LabaRugiPage /></React.Suspense>}>
        <Route path="tanggal/:dari/:ke" element={<React.Suspense fallback={<WaitMe />}><LabaRugiTanggal /></React.Suspense>} />
        {/* <Route path="akun" element={<React.Suspense fallback={<WaitMe />}><LoanPageForm /></React.Suspense>} /> */}
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