import React from 'react';
import { Flex, View } from '@adobe/react-spectrum';
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';


const Aside = () => {
  const [showMaster, setShowMaster] = React.useState(false);
  const [showCoa, setShowCoa] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);

  return (
    <Flex rowGap={'size-200'} direction='column'>
      <View><Link isQuiet variant='primary'><RouterLink to="/">Home</RouterLink></Link></View>

      <View>
        <Link variant='secondary' onPress={() => setShowMaster(!showMaster)}>Master</Link>
      </View>

      {showMaster &&
        <Flex direction={'column'} rowGap='size-200' marginX={'size-200'}>
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
            <Link isQuiet variant='primary' UNSAFE_style={{ lineHeight: '120%' }}>
              <RouterLink to="/finance">Pengelola Keuangan (Finance)</RouterLink>
            </Link>
          </View>
        </Flex>
      }

      <View>
        <Link isQuiet variant='primary'>
          <RouterLink to="/order">Order (SPK)</RouterLink>
        </Link>
      </View>

      <View>
        <Link variant='secondary' onPress={() => setShowCoa(!showCoa)}>COA (Char of Accounts)</Link>
      </View>

      {showCoa &&
        <Flex direction={'column'} rowGap='size-200' marginX={'size-200'}>
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
              <RouterLink to="/trx-type">Jenis Transaksi</RouterLink>
            </Link>
          </View>
          <View>
            <Link isQuiet variant='primary'>
              <RouterLink to="/trx">Transaksi</RouterLink>
            </Link>
          </View>
        </Flex>
      }

      <View>
        <Link variant='secondary' onPress={() => setShowReport(!showReport)}>Laporan</Link>
      </View>

      {showReport &&
        <Flex direction={'column'} rowGap='size-200' marginX={'size-200'}>
          <View>
            <RouterLink to={`/report/trx/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}>Laporan Saldo</RouterLink>
          </View>
          <View>
            <RouterLink to="/report/trx/profit">Laporan Laba Rugi</RouterLink>
          </View>
        </Flex>
      }

    </Flex>
  )
}

export default Aside;