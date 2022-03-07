import React, { useState } from 'react';
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
  //const [data, setData] = useState(initDetail)

  // const isCodeValid = React.useMemo(
  //   () => data.accCodeId > 0,
  //   [data]
  // )

  // const isDebtValid = React.useMemo(
  //   () => data.debt >= 0,
  //   [data]
  // )

  // const isCredValid = React.useMemo(
  //   () => data.cred >= 0,
  //   [data]
  // )

  // const isSaldoValid = React.useMemo(
  //   () => {
  //     if (data.cred === 0) {
  //       return data.debt > 0
  //     }
  //     if (data.debt === 0) {
  //       return data.cred > 0
  //     }
  //     return false
  //   },
  //   [data]
  // )

  // React.useEffect(() => {
  //   let isLoaded = true;

  //   if (isLoaded) {
  //     setData(detail)
  //   }

  //   return () => { isLoaded = false }
  // }, [detail])

  return (
    <View>
      <Flex rowGap='size-50' direction={'column'} marginTop={'size-50'}>
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-100' rowGap='size-50'>
          <ComboBox
            flex
            menuTrigger='focus'
            //validationState={isCodeValid ? "valid" : "invalid"}
            width={'auto'}
            aria-label={"Kode akun"}
            placeholder={"e.g. Kas / bank"}
            defaultItems={accs}
            selectedKey={data.accCodeId}
            onSelectionChange={(e) => changeData("accCodeId", +e)}
          >
            {(item) => <Item textValue={`${item.id} - ${item.name}`}>
              <Text><div style={{ fontWeight: 700 }}>{item.id} - {item.name}</div></Text>
              <Text slot='description'>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.typeName}</div>
                  <div>{item.descriptions || ""}</div>
                </div>
              </Text>
            </Item>}
          </ComboBox>
          <NumberField
            hideStepper={true}
            //validationState={isDebtValid ? 'valid' : 'invalid'}
            width={{ base: "auto", L: 'size-2000' }}
            aria-label={"debet-akun"}
            onChange={(e) => changeData("debt", e)}
            value={data.debt} />
          <NumberField
            hideStepper={true}
            //validationState={isCredValid ? 'valid' : 'invalid'}
            width={{ base: "auto", L: 'size-2000' }}
            aria-label={"cred-akun"}
            onChange={(e) => changeData("cred", e)}
            value={data.cred} />
          <View width={'size-1600'} UNSAFE_className={'text-center'}>
            {children}
          </View>
        </Flex>
      </Flex>
    </View>
  );
}

export default TrxDetailForm;