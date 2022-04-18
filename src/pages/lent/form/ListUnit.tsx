import React from "react";
import { Flex, View } from "@adobe/react-spectrum"
import { lentUnit } from '../interfaces';
import { FormatDate, FormatNumber } from "lib/format";
import { useUnitList } from "lib/useUnitList";

type ListUnitProps = {
  onSelectionChange?: (unit: lentUnit) => void
}

const ListUnit = ({ onSelectionChange }: ListUnitProps): JSX.Element => {
  //let [selectedKeys, setSelectedKeys] = React.useState<'all' | Set<React.Key>>(new Set([0]));
 // let collator = useCollator({ numeric: true });
  const  [value, setValue] = React.useState(0);

  const cols = [
    { id: 0, name: "", className: "text-center" },
    { id: 1, name: "ID", className:"text-center" },
    { id: 2, name: "TANGGAL", className:"text-center" },
    { id: 3, name: "MERK", className: "text-left" },
    { id: 4, name: "TIPE", className: "text-left" },
    { id: 5, name: "NOPOL", className: "text-left" },
    { id: 6, name: "TAHUN", className: "text-center" },
    { id: 7, name: "BT-FINANCE", className: "text-right" },
    { id: 8, name: "BT-MATEL", className: "text-right" },
  ]

  const unit = useUnitList();

  return (
    <View>
      <View marginY={'size-200'}>
        Total : {unit.count()} items, pilih salah satu unit yang akan dicicil.
      </View>
      <Flex direction={'column'}>
        <table cellPadding={4} className="table-small width-100-percent collapse-none">
          <thead>
            <tr className="border-b-1 border-t-1 bg-green-600 text-white">{cols.map(c => <th key={c.id} className={c.className}>{c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {unit.items.map(item => (
              <tr key={item.id} onClick={() => setValue(item.id)} className="border-b-gray-50">
                <td className={cols[0].className}><input type='checkbox' 
                  checked={value===item.id}                
                  onChange={() => onSelectionChange && onSelectionChange(item) } /> </td>
                <td className={cols[1].className}>{item.name}</td>
                <td className={cols[2].className}>{FormatDate(item.orderAt)}</td>
                <td className={cols[3].className}>{item.merk}</td>
                <td className={cols[4].className}>{item.type}</td>
                <td className={cols[5].className}>{item.nopol}</td>
                <td className={cols[6].className}>{item.year}</td>
                <td className={cols[7].className}>{FormatNumber(item.btFinance)}</td>
                <td className={cols[8].className}>{FormatNumber(item.btMatel)}</td>
              </tr>
            ))}
          </tbody>
        </table>      
      </Flex>
   </View>
  )
}

export default ListUnit;