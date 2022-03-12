import React, { useState } from 'react';
import { Flex, View } from '@adobe/react-spectrum';
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';


const Aside = () => {

  return (
    <Flex rowGap={'size-200'} direction='column' marginTop={'size-200'} marginX={'size-200'}>
      <View><Link isQuiet variant='primary' UNSAFE_className='font-bold'><RouterLink to="/">Home</RouterLink></Link></View>

      <MasterMenu title={'Master'}>

        <Flex direction={'column'} rowGap='size-200'>
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

        <Flex direction={'column'} rowGap='size-200'>
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

      <MasterMenu title={'Laporan'}>
        <Flex direction={'column'} rowGap='size-200'>
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
      <View UNSAFE_className='font-bold'>
        <Link variant='secondary' onPress={() => setShow(!show)}>{title}</Link>
      </View>

      {show && <View marginTop={'size-150'} marginX={'size-200'} UNSAFE_style={{ lineHeight: "80%"}}>{children}</View>}
    </div>
  )

}

export default Aside;