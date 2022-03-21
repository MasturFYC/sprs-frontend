import React from "react";

import { iBranch, iUnit, iOrder } from "../lib/interfaces"
import { FormatDate, FormatNumber } from "../lib/format";
import '../Order/table.css'

export interface OrderLists extends iOrder {
  isSelected: boolean,
  branch: iBranch,
  unit: iUnit
}

type TableOrderProps = {
  list?: OrderLists[],
  onCheck?: (id: number,e: boolean) => void
}
export default function TableOrder({ list, onCheck }: TableOrderProps) {
  
  return (
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th align="left">Mark</th>
          <th align="left" style={{ whiteSpace: 'nowrap' }}>NOMOR (SPK)</th>
          <th>TANGGAL</th>
          <th align="left">MERK</th>
          <th align="left">TYPE</th>
          <th align="left">NOPOL</th>
          <th>TAHUN</th>
          <th align="right" style={{ whiteSpace: 'nowrap' }}>BT FINANCE</th>
          {/* <th align="right" style={{ whiteSpace: 'nowrap' }}>BT MATEL</th> */}
        </tr>
      </thead>
      <tbody>
        {list && list.map((item, index) => <tr key={item.id} style={{ backgroundColor: index % 2 === 1 ? '#f3f3f3' : '#fff' }}>
          <td><input type='checkbox'  aria-label="order-was-selected" checked={item.isSelected}
            onChange={(e) => onCheck && onCheck(item.id,e.target.checked)} />
          </td>
          <td>{item.name}</td>
          <td align="center" style={{ whiteSpace: 'nowrap' }}>{FormatDate(item.orderAt)}</td>
          <td>{item.unit?.type?.merk?.name}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{item.unit?.type?.name}</td>
          <td>{item.unit?.nopol}</td>
          <td align="center">{item.unit?.year}</td>
          <td align="right">{FormatNumber(item.btFinance)}</td>
        </tr>
        )}
      </tbody>
    </table>
  )
}