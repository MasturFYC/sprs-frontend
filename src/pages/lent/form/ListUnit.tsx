import React, { useState } from "react";
import { Cell, Column, Row, TableBody, TableHeader, TableView, useAsyncList } from "@adobe/react-spectrum"
import { useCollator } from '@react-aria/i18n';
import { lentUnit } from '../interfaces';
import axios from 'lib/axios-base';
import { FormatDate, FormatNumber } from "lib/format";

type ListUnitProps = {
  onChange?: (unit: lentUnit) => void
}

const ListUnit = ({ onChange }: ListUnitProps): JSX.Element => {
  let [selectedKeys, setSelectedKeys] = React.useState<'all' | Set<React.Key>>(new Set([0]));
  let collator = useCollator({ numeric: true });  

  // let columns = [
  //   { name: 'ID#', uid: 'id' },
  //   { name: 'NAME', uid: 'name' },
  //   { name: 'TANGGAL', uid: 'orderAt' },
  //   { name: 'MERK', uid: 'merk' },
  //   { name: 'TIPE', uid: 'type' },
  //   { name: 'TAHUN', uid: 'year' },
  //   { name: 'NOPOL', uid: 'nopol' },
  //   { name: 'BT-FINANCE', uid: 'btFinance' },
  //   { name: 'BT-MATEL', uid: 'btMatel' },
  // ]

  let units = useAsyncList<lentUnit>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json', 
      }

      let res = await axios
        .get("/lents/get/units", { signal: signal, headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
          return []
        })
      return { items: res || [] }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          // @ts-expect-error
          let first = a[sortDescriptor.column]; // eslint-disable-line
          // @ts-expect-error
          let second = b[sortDescriptor.column]; // eslint-disable-line
          let cmp = collator.compare(first, second);
          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }
          return cmp;
        })
      };
    },

    getKey: (item: lentUnit) => item.id
  })

  return (
    <TableView
      sortDescriptor={units.sortDescriptor}
      onSortChange={units.sort}
      aria-label="table units"
      selectionMode={'single'}
      disallowEmptySelection
      overflowMode="wrap"
      density={'compact'}
      selectionStyle="checkbox"
      selectedKeys={selectedKeys}
      onSelectionChange={(e) => {
        const r = Object.values(e)
        onChange && onChange(units.getItem(+r[0]))
        setSelectedKeys(new Set(e))
      }}>
      <TableHeader>
        <Column allowsSorting key='name'>ID</Column>
        <Column allowsSorting key='orderAt' align={'center'}>TANGGAL</Column>
        <Column allowsSorting key='merk'>MERK</Column>
        <Column allowsSorting key='type'>TIPE</Column>
        <Column allowsSorting key='nopol'>NOPOL</Column>
        <Column allowsSorting key='year' align={'center'}>TAHUN</Column>
        <Column allowsSorting key='btFinance' align={'end'}>BT-FINANCE</Column>
        <Column allowsSorting key='btMatel' align={'end'}>BT-MATEL</Column>
      </TableHeader>
      <TableBody items={units.items}
        loadingState={units.loadingState}>
        {item => (
          <Row key={item.id}>
            <Cell>{item.name}</Cell>
            <Cell>{FormatDate(item.orderAt)}</Cell>
            <Cell>{item.merk}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.nopol}</Cell>
            <Cell>{item.year}</Cell>
            <Cell>{FormatNumber(item.btFinance)}</Cell>
            <Cell>{FormatNumber(item.btMatel)}</Cell>
          </Row>
        )
        }
      </TableBody>

    </TableView>
  )
}

export default ListUnit;