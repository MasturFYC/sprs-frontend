import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Flex, Item, ProgressCircle, TabList, Tabs } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "lib/format";
import { useLentList } from "lib/useLent";
import { iBranch } from "lib/interfaces";
import { useBranchList } from "lib/useBranch";

const LentListPage = () => {
  const { pathname } = useLocation();
  let [tab, setTab] = React.useState(0)

  let lent = useLentList()
  const {items: tabs, isLoading: branchIsLoading} = useBranchList();

  if (lent.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (<View>

    <View>
      <Tabs
        aria-label="Tab-Order"
        density='compact'
        items={[{ id: 0, name: "All", headBranch: "" }, ...tabs]}
        defaultSelectedKey={tab}
        onSelectionChange={(e) => {
          if (!branchIsLoading) {
            setTab(+e)
          }
        }}>
        <TabList aria-label="Tab-Order-List">
          {(item: iBranch) => <Item key={item.id}>{item.name}</Item>}
        </TabList>
      </Tabs>
    </View>

    {['R2', 'R3', 'R4'].map(r => <View key={r}>
      {getData(r).length > 0 &&
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
              {getData(r).map((o, i) => <tr key={o.orderId}>
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
                <th className="text-left" colSpan={4}>Total: {getData(r).length} items</th>
                <th className="text-left font-italic">Sisa pokok: {FormatNumber(getData(r).reduce((t, c) => t + c.payment.debt, 0) - getData(r).reduce((t, c) => t + c.payment.cred, 0))}</th>
                <th className="text-right">{FormatNumber(getData(r).reduce((t, c) => t + c.payment.debt, 0))}</th>
                <th className="text-right">{FormatNumber(getData(r).reduce((t, c) => t + c.payment.piutang, 0))}</th>
                <th className="text-right">{FormatNumber(getData(r).reduce((t, c) => t + c.payment.cred, 0))}</th>
                <th className="text-right">{FormatNumber(getData(r).reduce((t, c) => t + c.payment.saldo, 0))}</th>
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
          <td className={'text-right'}>{getTotalData().length} items</td>
        </tr>
        <tr>
          <td>Pokok</td>
          <td className="width-50 text-right">:</td>
          <td className={'text-right'}>{FormatNumber(getTotalData().reduce((t,c)=>t+c.payment.debt, 0))}</td>
        </tr>
        <tr>
          <td>Pinjaman</td>
          <td className="width-50 text-right">:</td>
          <td className={'text-right'}>{FormatNumber(getTotalData().reduce((t,c)=>t+c.payment.piutang, 0))}</td>
        </tr>
        <tr>
          <td>Cicilan</td>
          <td className="width-50 text-right">:</td>
          <td className={'text-right'}>{FormatNumber(getTotalData().reduce((t,c)=>t+c.payment.cred, 0))}</td>
        </tr>
        <tr>
          <td>Sisa Pinjaman</td>
          <td className="width-50 text-right">:</td>
          <td className={'text-right'}>{FormatNumber(getTotalData().reduce((t,c)=>t+c.payment.saldo, 0))}</td>
        </tr>
        <tr>
          <td>Sisa Pokok</td>
          <td className="width-50 text-right">:</td>
          <td className={'text-right'}><span className={'font-bold'}>{FormatNumber(getTotalData().reduce((t,c)=>t+c.payment.debt, 0) - getTotalData().reduce((t,c)=>t+c.payment.cred, 0))}</span></td>
        </tr>
      </tbody>
    </table>
  </View >);

  function getData(r: string) {
    const bName = tab === 0 
    ? ""
    : tabs.filter(f=>f.id === tab)[0].name;

    return tab === 0
    ? lent.items.filter(f => f.unit.wheel === r)
    : lent.items.filter(f => f.unit.wheel === r && f.unit.branch === bName)
  }

  function getTotalData() {
    const bName = tab === 0 
    ? ""
    : tabs.filter(f=>f.id === tab)[0].name;

    return tab === 0
    ? lent.items
    : lent.items.filter(f => f.unit.branch === bName)
  }

}


export default LentListPage;
function setTab(arg0: number) {
  throw new Error("Function not implemented.");
}

