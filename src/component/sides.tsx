import React, { Fragment, useEffect, useState } from 'react';
import { ActionButton, Flex, ProgressCircle, useAsyncList, View } from '@adobe/react-spectrum';
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';
import { iAccountInfo } from '../lib/interfaces';
import axios from "../lib/axios-base";
import RefreshIcon from '@spectrum-icons/workflow/DocumentRefresh'

type financeList = {
  id: number
  name: string
  shortName: string
}

type financeGroupMenu = {
  id: number
  name: string
  finances?: financeList[]
}

const Aside = () => {

  function getToday(): string {
    var d = new Date()
    return '' + d.getDate() + '-' + d.toLocaleString("id-ID", { month: "short" }).toLowerCase() + '-' + d.getFullYear()
  }
  return (
    <Flex rowGap={'size-200'} direction='column' marginTop={'size-200'} marginX={'size-100'}>
      <View><Link isQuiet variant='primary' UNSAFE_className='font-bold'><RouterLink to="/">Home</RouterLink></Link></View>

      <MasterMenu title={'Master'}>

        <Flex direction={'column'} rowGap='size-100'>
          <Link isQuiet variant='primary'>
            <RouterLink to="/wheel">Jenis Roda</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/merk">Merk Kendaraan</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/vehicle">Tipe Kendaraan</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/branch">Cabang Kantor</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/warehouse">Gudang</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/finance">Pengelola Keuangan (Finance)</RouterLink>
          </Link>
        </Flex>
      </MasterMenu>

      <View>
        <Link isQuiet variant='primary' UNSAFE_className='font-bold'>
          <RouterLink to={`/order/search/${getToday()}`}>Order (SPK)</RouterLink>
        </Link>
      </View>

      <FinanceMenu />

      <MasterMenu title={'COA (Chart of Accounts)'}>

        <Flex direction={'column'} rowGap='size-100'>
          <Link isQuiet variant='primary'>
            <RouterLink to="/acc-group">Group Akun</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/acc-type">Tipe Akun</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/acc-code">Kode Akun</RouterLink>
          </Link>
        </Flex>
      </MasterMenu>

      <AutoMenu />

      <MasterMenu title={'Laporan'}>
        <Flex direction={'column'} rowGap='size-100'>
          <Link isQuiet variant='primary'>
            <RouterLink to={`/report/trx/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}>Laporan Saldo (Group Akun)</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to={`/report/order-status/${new Date().getMonth() + 1}/${new Date().getFullYear()}/0/0/0/-/-`}>Status Order</RouterLink>
          </Link>
          <Link isQuiet variant='primary'>
            <RouterLink to="/labarugi">Laporan Keuangan</RouterLink>
          </Link>
        </Flex>
      </MasterMenu>
    </Flex>
  )
}


type MasterMenuProps = {
  title: String | React.ReactNode
  children: React.ReactNode
  onLinkPress?: (show: boolean) => void
}
function MasterMenu(props: MasterMenuProps) {
  const { title, children, onLinkPress } = props;
  const [show, setShow] = useState<Boolean>(false);


  return (
    <View flex>
      <View UNSAFE_className='font-bold' marginTop={'size-100'}>
        <Link variant='secondary' onPress={() => {
          onLinkPress && onLinkPress(!show);
          setShow(!show);
        }}>{title}</Link>
      </View>

      {show && <View marginTop={'size-100'} marginX={'size-200'}>{children}</View>}
    </View>
  )

}

function FinanceMenu() {

  let groups = useAsyncList<financeGroupMenu>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/finance-group/finances", { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return { items: res }
    },
    getKey: (item: financeGroupMenu) => item.id
  })

  if (groups.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle size='S' aria-label="Loading…" isIndeterminate /></Flex>
  }

  return <Flex direction={'row'} gap={'size-50'}>
    <ActionButton isQuiet onPress={() => {
      groups.reload()
    }}><RefreshIcon size="S" /></ActionButton>
    <MasterMenu title={'Invoice'}>
      <View>
        <Link isQuiet variant='primary'>
          <RouterLink to="/invoice/list"><b>Daftar Invoices</b></RouterLink>
        </Link>
      </View>

      {groups.items.map(g => <View key={g.id} marginY={'size-50'}>
        <MasterMenu title={g.name}>
          {g.finances && g.finances.map(f => <View key={f.id} marginY={'size-50'}>
            <Link isQuiet variant='primary'>
              <RouterLink to={`/invoice/${f.id}/0`}>{f.name} ({f.shortName})</RouterLink>
            </Link>
          </View>
          )}
        </MasterMenu>
      </View>
      )}
    </MasterMenu>

  </Flex>
}

function AutoMenu() {
  const [types, setTypes] = useState<iAccountInfo[]>([]);
  const [accounts, setAccounts] = useState<iAccountInfo[]>([]);
  const [isMenuLoaded, SetMenuLoaded] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    let isLoaded = false;

    async function loadAccounts() {
      const headers = {
        'Content-Type': 'application/json'
      }
      let res = await axios
        .get(`/acc-group/all-accounts`, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })
        return res ? res : []
    }

    loadAccounts().then(data=> {
      if (!isLoaded || !show) {
        setTypes(data.filter((c: iAccountInfo) => c.isType));
        setAccounts(data.filter((c: iAccountInfo) => c.isAutoDebet && c.isActive && c.isAccount));
        SetMenuLoaded(true)
      }
    });
    return () => { isLoaded = true }
  }, [isMenuLoaded, show])

  if (!isMenuLoaded) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <MasterMenu title={'Transaksi'} onLinkPress={(e) => setShow(!show)}>
      <Flex direction={'column'} rowGap={'size-100'}>
        <Link isQuiet variant='primary'>
          <RouterLink to="/trx"><b>Ledger (Buku Besar)</b></RouterLink>
        </Link>
        <Link isQuiet variant='primary'>
          <RouterLink to="/loan/list"><b>Piutang</b></RouterLink>
        </Link>
        <Link isQuiet variant='primary'>
          <RouterLink to="/lent/list"><b>Pinjaman Unit</b></RouterLink>
        </Link>
      </Flex>

      {types.map(t => {

        if (accounts.filter(f => f.typeId === t.id).length > 0) {
          return <View key={t.id}>
            <MasterMenu title={t.name}>
              {
                accounts.filter(f => f.typeId === t.id).map(a => {
                  return (<View key={a.id} marginY={'size-50'}>
                    <Link isQuiet variant='primary'>
                      <RouterLink to={`/trx-auto-debet/${a.id}`}>{a.name}</RouterLink>
                    </Link>
                  </View>)
                })
              }
            </MasterMenu>
          </View>
        }

        return <Fragment key={t.id}></Fragment>
      })
      }
    </MasterMenu>
  )
}

export default Aside;