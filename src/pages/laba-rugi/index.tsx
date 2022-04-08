import React from "react";
import { Outlet, } from "react-router-dom";
import { Link as RouteLink } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Link } from "@react-spectrum/link";
import { Flex } from "@react-spectrum/layout";
import { dateParam, dateOnly } from "lib/interfaces";

const LabaRugiPage = () => {

  return (
    <View marginX={'size-400'}>
      <View><span className="div-h1">Laporan Keuangan</span></View>
      <Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
        <Link isQuiet variant="primary"><RouteLink to={`/labarugi/tanggal/${dateOnly(dateParam(null))}/${dateOnly(dateParam(null))}`}>Laba Rugi per Tanggal</RouteLink></Link>
        <Link isQuiet variant="primary"><RouteLink to={'/labarugi/akun'}>Laporan Transaksi per Akun</RouteLink></Link>
      </Flex>
      <Outlet />
    </View>
  );

}

export default LabaRugiPage;