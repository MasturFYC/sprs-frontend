import { Flex, View } from '@adobe/react-spectrum';
import { Fragment } from 'react'
import { Link } from "react-router-dom";

const Aside = () => {

  return (
    <Fragment>
      <div><Link to="/">Home</Link></div>

      <div><h3>Master</h3></div>

      <Flex direction={'column'} rowGap='size-200' marginX={'size-200'}>
        <View><Link to="/merk">Merk Kendaraan</Link></View>
        <View><Link to="/wheel">Jenis Roda Kendaraan</Link></View>
        <View><Link to="/vehicle">Tipe Kendaraan</Link></View>
      </Flex>
    </Fragment>
  )
}

export default Aside;