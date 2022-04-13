import React from "react";
import { Outlet, } from "react-router-dom";
import { Link as RouteLink } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Link } from "@react-spectrum/link";
import { Flex } from "@react-spectrum/layout";
import { Text } from "@react-spectrum/text";
import { dateParam, dateOnly } from "lib/interfaces";
import Layer from "@spectrum-icons/workflow/Article";
import Histogram from "@spectrum-icons/workflow/Histogram";

const LabaRugiPage = () => {

  return (
    <View>
      <div className="spectrum-Typography spectrum-Heading spectrum-Heading--sizeXL">Laporan Keuangan</div>
      <Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
        <Flex direction={'row'} columnGap={'size-75'}>
          <Histogram size="S" />
          <Link isQuiet variant="primary">
            <RouteLink to={`/labarugi/tanggal/${dateOnly(dateParam(null))}/${dateOnly(dateParam(null))}`}>
              <Text>Laba Rugi per Tanggal</Text>
            </RouteLink>
          </Link>
        </Flex>
        <Flex direction={'row'} columnGap={'size-75'}>
          <Layer size="S" />
          <Link isQuiet variant="primary">
            <RouteLink to={'/labarugi/akun'}>
              <Text>Laporan Transaksi per Akun</Text>
            </RouteLink>
          </Link>
        </Flex>
      </Flex>
      <Outlet />
    </View>
  );

}

export default LabaRugiPage;