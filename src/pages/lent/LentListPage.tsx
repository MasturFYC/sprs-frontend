import React, { Fragment } from "react";
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

  return (<View>
    {['R2', 'R3', 'R4'].map(r => <View key={r}>
      {lent.items.filter(f => f.unit.wheel === r).length > 0 &&
        <Fragment>
          <View marginTop={'size-200'} marginBottom={'size-100'}><span className={'div-h2 font-bold'}>{r}</span></View>
          <table className="table-small table-100 collapse-none" cellPadding={6}>
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="text-center">NO</th>
                <th className="text-center text-no-wrap">TANGGAL</th>
                <th className="text-left">NAMA</th>
                <th className="text-left">ALAMAT</th>
                <th className="text-left">UNIT</th>
                <th className="text-right width-80">POKOK</th>
                <th className="text-right width-80">PINJAMAN</th>
                <th className="text-right width-80">CICILAN</th>
                <th className="text-right width-80 text-no-wrap">SISA PINJAMAN</th>
              </tr>
            </thead>
            <tbody>
              {lent.items.filter(f => f.unit.wheel === r).map((o, i) => <tr key={o.orderId}>
                <td className="text-center">{i + 1}</td>
                <td className="text-center text-no-wrap">{FormatDate(o.unit.orderAt)}</td>
                <td className="text-left"><Link to={`/lent/${o.orderId}`} state={{ from: pathname }}>{o.name}</Link></td>
                <td className="text-left">{o.street}, {o.city} - {o.zip}</td>
                <td className="text-left">{o.unit.merk} {o.unit.type} : {o.unit.nopol}, tahun: {o.unit.year}</td>
                <td className="text-right">{FormatNumber(o.payment.debt)}</td>
                <td className="text-right">{FormatNumber(o.payment.piutang)}</td>
                <td className="text-right">{FormatNumber(o.payment.cred)}</td>
                <td className="text-right">{FormatNumber(o.payment.saldo)}</td>
              </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th className="text-left" colSpan={4}>Total: {lent.count(r)} items</th>
                <th className="text-left font-italic">Sisa pokok: {FormatNumber(lent.totalDebt(r) - lent.totalCred(r))}</th>
                <th className="text-right">{FormatNumber(lent.totalDebt(r))}</th>
                <th className="text-right">{FormatNumber(lent.totalPiutang(r))}</th>
                <th className="text-right">{FormatNumber(lent.totalCred(r))}</th>
                <th className="text-right">{FormatNumber(lent.totalSaldo(r))}</th>
              </tr>
            </tfoot>
          </table>
        </Fragment>
      }
    </View>)
    }
    <View marginTop={'size-400'}><span className={'font-bold font-italic'}>Summary:</span></View>
    <table className={'table-small2'}>
      <tbody>
      <tr>
        <td>Item</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}>{lent.count()} items</td>
      </tr>
      <tr>
        <td>Pokok</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}>{FormatNumber(lent.totalDebt())}</td>
      </tr>
      <tr>
        <td>Pinjaman</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}>{FormatNumber(lent.totalPiutang())}</td>
      </tr>
      <tr>
        <td>Cicilan</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}>{FormatNumber(lent.totalCred())}</td>
      </tr>
      <tr>
        <td>Sisa Pinjaman</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}>{FormatNumber(lent.totalSaldo())}</td>
      </tr>
      <tr>
        <td>Sisa Pokok</td>
        <td className="width-50 text-right">:</td>
        <td className={'text-right'}><span className={'font-bold'}>{FormatNumber(lent.totalDebt() - lent.totalCred())}</span></td>
      </tr>
      </tbody>
    </table>
  </View >);
}

export default LentListPage;
