import React from 'react';
import { iAccCodeType, iTrxDetail } from '../../../lib/interfaces'
import {
  ComboBox, Flex, Item, NumberField,
  Text,
  View
} from '@adobe/react-spectrum';

export const initDetail: iTrxDetail = {
  id: 0,
  accCodeId: 0,
  trxId: 0,
  debt: 0,
  cred: 0
}

type TrxDetailFormOptions = {
  data: iTrxDetail,
  accs: iAccCodeType[],
  changeData: (fieldName: string, value: string | number | boolean | undefined | null) => void,
  children: JSX.Element
}

const TrxDetailForm: React.FC<TrxDetailFormOptions> = ({ data, changeData, accs, children }) => {

  return (
    <Flex direction={{ base: 'column', M: 'row' }} columnGap='size-100'>
      <ComboBox
        flex
        menuTrigger='focus'
        width={'auto'}
        aria-label={"Kode akun"}
        placeholder={"e.g. Kas / bank"}
        defaultItems={accs}
        selectedKey={data.accCodeId}
        onSelectionChange={(e) => changeData("accCodeId", +e)}
      >
        {(item) => <Item textValue={`${item.id} - ${item.name}`}>
          <Text><div style={{ fontWeight: 700 }}>{item.id} - {item.name}</div></Text>
          <Text slot='description'><span className='font-bold'>{item.typeName}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
        </Item>}
      </ComboBox>
      <NumberField
        hideStepper={true}
        width={{ base: "auto", L: 'size-2000' }}
        aria-label={"debet-akun"}
        onChange={(e) => changeData("debt", e)}
        value={data.debt} />
      <NumberField
        hideStepper={true}
        width={{ base: "auto", L: 'size-2000' }}
        aria-label={"cred-akun"}
        onChange={(e) => changeData("cred", e)}
        value={data.cred} />
      <View width={'size-1600'}>{children}</View>
    </Flex>
  );
}

export default TrxDetailForm;