import React from "react";
import { Link, useLocation } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Flex, ProgressCircle } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "lib/format";
import { useLentList } from "lib/useLent";


const LentListPage = () => {
  const { pathname } = useLocation();

  let lent = useLentList()
  
  if (lent.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <table className="table-small width-100-percent collapse-none" cellPadding={5}>
        <thead>
          <tr className="bg-green text-white">
            <th className="text-center">NO</th>
            <th className="text-center text-no-wrap">TANGGAL</th>
            <th className="text-left">NAMA</th>
            <th className="text-left">ALAMAT</th>
            <th className="text-left">UNIT</th>
            <th className="text-right">POKOK</th>
            <th className="text-right">PINJAMAN</th>
            <th className="text-right">CICILAN</th>
            <th className="text-right text-no-wrap">SISA PINJAMAN</th>
          </tr>
        </thead>
        <tbody>
          {lent.items.map((o, i) => <tr key={o.orderId}>
            <td className="text-center">{i + 1}</td>
            <td className="text-center text-no-wrap">{FormatDate(o.unit.orderAt)}</td>
            <td className="text-left"><Link to={`/lent/${o.orderId}`} state={{ from: pathname }}>{o.name}</Link></td>
            <td className="text-left">{o.street}, {o.city} - {o.zip}</td>
            <td className="text-left">({o.unit.wheel}) {o.unit.merk} {o.unit.type} : {o.unit.nopol}, tahun: {o.unit.year}</td>
            <td className="text-right">{FormatNumber(o.payment.debt)}</td>
            <td className="text-right">{FormatNumber(o.payment.piutang)}</td>
            <td className="text-right">{FormatNumber(o.payment.cred)}</td>
            <td className="text-right">{FormatNumber(o.payment.saldo)}</td>
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th className="text-left" colSpan={5}>Total: {lent.count()} items</th>
            <th className="text-right font-bold">{FormatNumber(lent.totalDebt())}</th>
            <th className="text-right font-bold">{FormatNumber(lent.totalPiutang())}</th>
            <th className="text-right font-bold">{FormatNumber(lent.totalCred())}</th>
            <th className="text-right font-bold">{FormatNumber(lent.totalSaldo())}</th>
          </tr>
        </tfoot>
      </table>
   </View>
  );

}

export default LentListPage;