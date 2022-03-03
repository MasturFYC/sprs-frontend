import React from 'react';
import { Flex, View } from '@adobe/react-spectrum';
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';


const Aside = () => {
  const [showMaster, setShowMaster] = React.useState(false);

  return (
    <Flex rowGap={'size-200'} direction='column'>
      <View><Link isQuiet variant='primary'><RouterLink to="/">Home</RouterLink></Link></View>

      <View><Link variant='secondary' onPress={() => setShowMaster(!showMaster)}>
        Master
      </Link></View>
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
          <View>
            <Link isQuiet variant='primary' UNSAFE_style={{ lineHeight: '120%' }}>
              <RouterLink to="/action">Tindakan</RouterLink>
            </Link>
          </View>
        </Flex>
      }
    </Flex>
  )
}

export default Aside;