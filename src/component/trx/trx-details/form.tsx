import React, { useState } from 'react';
import { iAccCodeType, iTrxDetail } from '../../../lib/interfaces'
import SaveIcon from '@spectrum-icons/workflow/Checkmark'
import {
  ActionButton,
  ComboBox, Flex, Item, NumberField,
  Text
} from '@adobe/react-spectrum';

export const initDetail: iTrxDetail = {
  id: 0,
  codeId: 0,
  trxId: 0,
  debt: 0,
  cred: 0
}

type TrxDetailFormOptions = {
  data: iTrxDetail,
  accs: iAccCodeType[],
  //changeData: (fieldName: string, value: string | number | boolean | undefined | null) => void,
  updateData: (method: string, data: iTrxDetail) => void
  children: JSX.Element
}

function TrxDetailForm(props: TrxDetailFormOptions) {
  const {
    data,
    //changeData, 
    accs,
    children,
    updateData } = props;

  const [item, setItem] = useState<iTrxDetail>(initDetail);

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setItem(data)
    }

    return () => { isLoaded = true }
  }, [data])

  return (
    <Flex direction={{ base: 'column', M: 'row' }} columnGap='size-100'>
      <ComboBox
        flex
        menuTrigger='focus'
        width={'auto'}
        aria-label={"Kode-akun"}
        placeholder={"e.g. Kas / bank"}
        defaultItems={accs}
        selectedKey={item.codeId}
        onSelectionChange={(e) => {
          handleChange("codeId", +e)
          //changeData("accCodeId", +e)
        }}
      >
        {(item) => <Item textValue={`${item.id} - ${item.name}`}>
          <Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
          <Text slot='description'><span className='font-bold'>{item.typeName}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
        </Item>}
      </ComboBox>
      <NumberField
        hideStepper={true}
        width={{ base: "auto", L: 'size-2000' }}
        aria-label={"debet-akun"}
        onChange={(e) => {
          handleChange("debt", e)
          //changeData("debt", e)
        }}
        value={item.debt} />
      <NumberField
        hideStepper={true}
        width={{ base: "auto", L: 'size-2000' }}
        aria-label={"cred-akun"}
        onChange={(e) => {
          handleChange("cred", e)
          //changeData("cred", e)
        }}
        value={item.cred} />
      <Flex direction={'row'} width={'size-1600'} columnGap={'size-50'}>
        <ActionButton isQuiet height={'size-200'} marginTop={'size-50'}
          onPress={() => updateData('save', item)}>
          <SaveIcon size='M' />
        </ActionButton>
        {children}
      </Flex>
    </Flex>
  );

  function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
    setItem(o => ({ ...o, [fieldName]: value }))
  }
}

export default TrxDetailForm;