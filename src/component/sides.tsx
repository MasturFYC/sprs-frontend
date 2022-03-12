import React, { Fragment, useEffect, useState } from 'react';
import { Flex, ProgressCircle, View } from '@adobe/react-spectrum';
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';
import { iAccCode, iAccGroup, iAccType } from '@src/lib/interfaces';
import axios from "../lib/axios-base";


const Aside = () => {

  return (
    <Flex rowGap={'size-200'} direction='column' marginTop={'size-200'} marginX={'size-200'}>
      <View><Link isQuiet variant='primary' UNSAFE_className='font-bold'><RouterLink to="/">Home</RouterLink></Link></View>

      <MasterMenu title={'Master'}>

        <Flex direction={'column'} rowGap='size-50'>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/wheel">Jenis Roda</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/merk">Merk Kendaraan</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/vehicle">Tipe Kendaraan</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/branch">Cabang Kantor</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/warehouse">Gudang</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/finance">Pengelola Keuangan (Finance)</RouterLink>
            </Link>
          </View>
        </Flex>
      </MasterMenu>

      <View>
        <Link isQuiet variant='primary' UNSAFE_className='font-bold'>
          <RouterLink to="/order">Order (SPK)</RouterLink>
        </Link>
      </View>

      <MasterMenu title={'COA (Char of Accounts)'}>

        <Flex direction={'column'} rowGap='size-50'>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/acc-group">Group Akun</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/acc-type">Tipe Akun</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/acc-code">Kode Akun</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/trx">Transaksi</RouterLink>
            </Link>
          </View>
        </Flex>
      </MasterMenu>

      <AutoMenu />

      <MasterMenu title={'Laporan'}>
        <Flex direction={'column'} rowGap='size-50'>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to={`/report/trx/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}>Laporan Saldo</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/report/trx/profit">Laporan Laba Rugi</RouterLink>
            </Link>
          </View>
        </Flex>
      </MasterMenu>
    </Flex>
  )
}
type MasterMenuProps = {
  title: String
  children: React.ReactNode
}
function MasterMenu(props: MasterMenuProps) {
  const { title, children } = props;
  const [show, setShow] = useState<Boolean>(false);


  return (
    <div>
      <View UNSAFE_className='font-bold' marginTop={'size-100'}>
        <Link variant='secondary' onPress={() => setShow(!show)}>{title}</Link>
      </View>

      {show && <View marginTop={'size-100'} marginX={'size-200'}>{children}</View>}
    </div>
  )

}



type allAccount = {
  groups?: iAccGroup[]
  types?: iAccType[]
  accounts?: iAccCode[]
}

function AutoMenu() {
  const [account, setAccount] = useState<allAccount>();

  useEffect(() => {
    let isLoaded = false;

    async function loadAccounts() {
      const headers = {
        'Content-Type': 'application/json'
      }
      await axios
        .get(`/acc-group/all-accounts/`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          setAccount(data)
        })
        .catch(error => {
          console.log({ 'Error': error })
          return []
        })
    }

    if (!isLoaded) {
      loadAccounts()
    }
    return () => { isLoaded = true }
  },[])

  if (!account) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }
  return (
    <MasterMenu title={'Transaksi'}>
      {account.types && account.types.filter(f => f.groupId > 1).map(t => {
        if (account.accounts && account.accounts.filter(f => f.typeId === t.id && f.isAutoDebet).length > 0) {
          return <View key={t.id}>
            <MasterMenu title={t.name}>
              {
                account.accounts && account.accounts.filter(f => f.typeId === t.id && f.isAutoDebet).map(a => {
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
        return <Fragment></Fragment>
      })
      }
    </MasterMenu>
  )
}

export default Aside;