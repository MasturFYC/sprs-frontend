import React from "react";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { iWheel } from "../lib/interfaces";
import axios from "../lib/axios-base";
import { useAsyncList } from "@react-stately/data";

type LabelPosition = 'top' | 'side';
type Alignment = 'start' | 'end';
type ComboWheelProps = {
  selectedKey?: React.Key | undefined,
  onSelectionChange?: (id: number) => void,
  label?: React.ReactNode,
  labelPosition?: LabelPosition,
  placeHolder?: string
  labelAlign?: Alignment
}
export default function ComboWheel({ 
  onSelectionChange: onChange, 
  label, 
  labelPosition, 
  placeHolder, 
  selectedKey,
  labelAlign
}: ComboWheelProps) {

  let wheel = useAsyncList<iWheel>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/wheels", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log(error)
        })

      return { items: res }
    },
    getKey: (item: iWheel) => item.id
  })

  return <ComboBox
    flex
    width={'auto'}
    label={label}
    minWidth={'size-1000'}
    aria-label="combo-wheel"
    loadingState={wheel.loadingState}    
    labelPosition={labelPosition || 'top'}
    labelAlign={labelAlign}
    menuTrigger='focus'
    placeholder={placeHolder || 'e.g. Jatibarang'}
    defaultItems={[{
      id: 0,
      name: 'Semua jenis'
    }, ...wheel.items]}
    defaultSelectedKey={selectedKey}
    onSelectionChange={(e) => {
      if(onChange) {
        onChange(+e)
      } 
    }}
  >
    {(item) => <Item textValue={item.name}>{item.name}</Item>}
  </ComboBox>  
}