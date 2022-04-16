//import React from "react";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { useWheelList } from "lib/useWheel";

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

  const wheel = useWheelList();

  return <ComboBox
    flex
    width={'auto'}
    label={label}
    minWidth={'size-1000'}
    aria-label="combo-wheel"
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