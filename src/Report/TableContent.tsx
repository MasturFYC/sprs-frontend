//import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormatDate, FormatNumber } from '../lib/format';
import { TableFooter } from "./TableFooter";
import { TableHead } from "./TableHead";
import { View } from '@react-spectrum/view';
import { Flex } from '@react-spectrum/layout';
import { tOrderInvoiced } from './interface';


export function TableContent(status: number, orders: tOrderInvoiced[]): JSX.Element {
  const { pathname } = useLocation();

  return (<View>
    <table className={'table-100 table-small collapse-none'} cellPadding={4}>
      <TableHead status={status} />
      <tbody>
        {orders.filter(f => f.status === status).map((o, i) => <tr key={o.id} className={`border-b-gray-50 ${i % 2 === 1 ? 'bg-green-50' : 'bg-white'} bg-hover`}>
          <td className='text-center'>{i + 1}</td>
          <td className='text-center'>{FormatDate(o.orderAt, '2-digit')}</td>
          <td className='text-no-wrap'><Link to={`/order/${o.id}`} state={{ from: pathname }}>{o.name}</Link></td>
          <td>{o.branch.name}</td>
          <td>{o.finance.name} ({o.finance.shortName})</td>
          <td>{o.unit && o.unit.type.name}</td>
          <td>{o.unit && o.unit.type.merk.name}</td>
          <td className='text-no-wrap'>{o.unit && o.unit.nopol}</td>
          <td className='text-center'>{o.unit && o.unit.year}</td>
          <td className={"text-center"}>{o.isStnk ? '✔' : ''}</td>
          <td className='text-right'>{FormatNumber(o.btFinance)}</td>
          <td className='text-right'>{FormatNumber(o.btMatel)}</td>
        </tr>
        )}
      </tbody>
      <TableFooter>
        {{
          count: <td colSpan={10} className={'border-b-1 border-t-1'}>Total : {orders.filter(f => f.status === status).length}</td>,
          btFinance: <td className='border-b-1 border-t-1 text-right font-bold'>{FormatNumber(orders.filter(f => f.status === status).reduce((t, c) => t + c.btFinance, 0))}</td>,
          btMatel: <td className='border-b-1 border-t-1 text-right font-bold'>{FormatNumber(orders.filter(f => f.status === status).reduce((t, c) => t + c.btMatel, 0))}</td>,
        }}
      </TableFooter>
      {/* <TableFooter count={orders.filter(f => f.status === status).length}
            finance={orders.filter(f => f.status === status).reduce((t, c) => t + c.btFinance, 0)}
            matel={orders.filter(f => f.status === status).reduce((t, c) => t + c.btMatel, 0)} /> */}
    </table>
    {status === 0 &&
      <View>
        <View marginTop={'size-400'}><i>Summary:</i></View>
        <Flex direction={'row'} columnGap={'size-200'}>
          <View width={'size-1250'}>Total item</View>
          <View width={'size-1250'} UNSAFE_className='text-right'><strong>{orders.length} items</strong></View>
        </Flex>
        <Flex direction={'row'} columnGap={'size-200'}>
          <View width={'size-1250'}>Total BT Finance</View>
          <View width={'size-1250'} UNSAFE_className='text-right'><strong>{FormatNumber(orders.reduce((t, c) => t + c.btFinance, 0))}</strong></View>
        </Flex>
        <Flex direction={'row'} columnGap={'size-200'}>
          <View width={'size-1250'}>Total BT Matel</View>
          <View width={'size-1250'} UNSAFE_className='text-right'><strong>{FormatNumber(orders.reduce((t, c) => t + c.btMatel, 0))}</strong></View>
        </Flex>
        {/* <Flex direction={'row'} columnGap={'size-200'}>
                    <View width={'size-1250'}>Grand Total</View>
                    <View width={'size-1250'} UNSAFE_className='text-right'><strong>{FormatNumber(orders.reduce((t, c) => t + c.btMatel + c.btFinance, 0))}</strong></View>
                  </Flex>          */}
      </View>}
  </View>);
}
