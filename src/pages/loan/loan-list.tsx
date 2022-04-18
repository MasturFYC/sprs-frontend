import React from "react";
import { Link, useLocation } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Flex, ProgressCircle } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "lib/format";
import { iLoan } from "lib/interfaces";

import { useLoanList } from "lib/useLoan";

export interface LoanAll extends iLoan {
  trxID: number
  division?: string
  descriptions?: string
  trxDate: string
  memo?: string
  loan: {
    debt: number
    cred: number
    piutang: number
    saldo: number
  }
}

const LoanListPage = () => {
  // let navigate = useNavigate()
  const { pathname } = useLocation();
  //	const { id: paramId, name: typeName } = useParams()

  const loan = useLoanList()

  if (loan.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <table className="table-small width-100-percent collapse-none" cellPadding={4}>
        <thead>
          <tr className="border-b-1 border-t-1 bg-green-600 text-white">
            <th className="text-center">NO</th>
            <th className="text-center text-no-wrap">TANGGAL</th>
            <th className="text-left">NAMA</th>
            <th className="text-left">ALAMAT</th>
            <th className="text-right">POKOK</th>
            <th className="text-center">PROSENTASE</th>
            <th className="text-right">PIUTANG</th>
            <th className="text-right">ANGSURAN</th>
            <th className="text-right text-no-wrap">SISA PIUTANG</th>
          </tr>
        </thead>
        <tbody>
          {loan.items.map((o, i) => <tr key={o.id} className="border-b-gray-50">
            <td className="text-center">{i + 1}</td>
            <td className="text-center text-no-wrap">{FormatDate(o.trxDate)}</td>
            <td className="text-no-wrap"><Link to={`/loan/${o.id}`} state={{ from: pathname }}>{o.name}</Link></td>
            <td>{o.street}, {o.city} - {o.zip}</td>
            <td className="text-right">{FormatNumber(o.loan.debt)}</td>
            <td className="text-center">{FormatNumber(o.persen)}%</td>
            <td className="text-right">{FormatNumber(o.loan.piutang)}</td>
            <td className="text-right">{FormatNumber(o.loan.cred)}</td>
            <td className="text-right">{FormatNumber(o.loan.saldo)}</td>
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-b-1">
            <td className="border-t-1" colSpan={4}>Total: {loan.count()} items</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(loan.totalDebt())}</td>
            <td className="text-right border-t-1 font-bold">{' '}</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(loan.totalPiutang())}</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(loan.totalCred())}</td>
            <td className="text-right border-t-1 font-bold">{FormatNumber(loan.totalSaldo())}</td>
            {/* <td className="text-right border-t-1 font-bold">{FormatNumber(getTotalSisaPiutang())}</td> */}
          </tr>
        </tfoot>
      </table>
      {/* <PrettyPrintJson data={loan.items} /> */}
   </View>
  );

  // function getSisaPiutang(p: LoanAll): number {
  //   const sisa = (p.loan.debt + (p.loan.debt * (p.persen / 100))) - p.loan.cred;
  //   return sisa
  // }


  // function getTotalSisaPiutang(): number {
  //   const cred = loan.items.reduce((t, c) => t + c.loan.cred, 0)
  //   const sisa = loan.items.reduce((t, c) => t + (c.loan.debt + (c.loan.debt * (c.persen / 100))), 0)
  //   return sisa - cred
  // }

}

export default LoanListPage;
