import React from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "lib/axios-base";
import { View } from "@react-spectrum/view";
import { Flex, ProgressCircle, useAsyncList } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "lib/format";

import 'Report/report.css'
import { PrettyPrintJson } from "lib/utils";
import { tsLent } from "./interfaces";


const LentListPage = () => {
  const { pathname } = useLocation();

  let lent = useAsyncList<tsLent>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/lents", { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
          return []
        })
      return { items: res || [] }
    },
    getKey: (item: tsLent) => item.orderId
  })


  if (lent.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <table className="table-small width-100-percent collapse-none" cellPadding={4}>
        <thead>
          <tr className="border-b-1 border-t-1 bg-green text-white">
            <th className="text-center">NO</th>
            <th className="text-center text-no-wrap">TANGGAL</th>
            <th className="text-left">NAMA</th>
            <th className="text-left">ALAMAT</th>
            <th className="text-right">UNIT</th>
            <th className="text-center">BT FINANCE</th>
            <th className="text-right">BT MATEL</th>
            <th className="text-right">ANGSURAN</th>
            <th className="text-right text-no-wrap">SISA PIUTANG</th>
          </tr>
        </thead>
        <tbody>
          {lent.items.map((o, i) => <tr key={o.orderId} className="border-b-gray-50">
            <td className="text-center">{i + 1}</td>
            <td className="text-center text-no-wrap">{FormatDate(o.unit.orderAt)}</td>
            <td className="text-no-wrap"><Link to={`/lent/${o.orderId}`} state={{ from: pathname }}>{o.name}</Link></td>
            <td>{o.street}, {o.city} - {o.zip}</td>
            <td>{o.unit.nopol}, tahun: {o.unit.year}, {o.unit.merk} {o.unit.type} ({o.unit.wheel})</td>
            <td className="text-right">{FormatNumber(o.payment.debt)}</td>
            <td className="text-right">{FormatNumber(o.payment.cred)}</td>
            <td className="text-right">{FormatNumber(o.payment.saldo)}</td>
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-b-1">
            <td className="border-t-1" colSpan={5}>Total: {lent.items.length} items</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(lent.items.reduce((t, c) => t + c.payment.debt, 0))}</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(lent.items.reduce((t, c) => t + c.payment.cred, 0))}</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(lent.items.reduce((t, c) => t + c.payment.saldo, 0))}</td>
          </tr>
        </tfoot>
      </table>
      <PrettyPrintJson data={lent.items} /> 
   </View>
  );

}

export default LentListPage;