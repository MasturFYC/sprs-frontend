//import React from "react";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { Text  } from "@react-spectrum/text";
import { useBranchList } from "lib/useBranch";

type LabelPosition = 'top' | 'side';
type Alignment = 'start' | 'end';
type ComboBranchProps = {
  selectedKey?: React.Key | undefined,
  onSelectionChange?: (id: number) => void,
  label?: React.ReactNode,
  labelPosition?: LabelPosition,
  placeHolder?: string
  labelAlign?: Alignment
}
export default function ComboBranch({ 
  onSelectionChange: onChange, 
  label, 
  labelPosition, 
  labelAlign,
  placeHolder, 
  selectedKey
}: ComboBranchProps) {

  const branch = useBranchList()
    
 
  return <ComboBox
    flex
    width={'auto'}
    label={label}
    aria-label="combo-search"
    labelAlign={labelAlign}
    labelPosition={labelPosition || 'top'}
    menuTrigger='focus'
    placeholder={placeHolder || 'e.g. Jatibarang'}
    defaultItems={[{
      id: 0,
      name: 'Semua Cabang',
      headBranch: ''
    }, ...branch.items]}
    defaultSelectedKey={selectedKey}
    onSelectionChange={(e) => {
      if(onChange) {
        onChange(+e)
      } 
    }}
  >
    {(item) => <Item textValue={item.name}>
      <Text>{item.name}</Text>
      <Text slot='description'>
        {item.id > 0 ?
          <div>Kepala Cabang: <span style={{ fontWeight: 700 }}>{item.headBranch}</span><br />
            {item?.street}{item.city ? `, ${item.city}` : ''}
            {item.zip ? ` - ${item.zip}` : ''}<br />
            {item.phone ? `Telp. ${item.phone}` : ''}
            {item.cell && item.phone ? ` / ` : ''}
            {item.cell && item.phone === '' ? `Cellular: ` : ''}
            {item.cell ?? ''}<br />{item.email ? `e-mail: ${item.email}` : ''}
          </div>
          :
          <div>{item.headBranch}</div>
        }
      </Text>
    </Item>}
  </ComboBox>  
}