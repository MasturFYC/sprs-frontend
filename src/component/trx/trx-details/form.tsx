import React, { FormEvent } from 'react';
import { iAccCodeType, iTrxDetail } from '../../../lib/interfaces'
import {
  Button, ComboBox, Flex, Item, NumberField,
  Text
} from '@adobe/react-spectrum';
import SaveIcon from '@spectrum-icons/workflow/SaveTo'
import Removecon from '@spectrum-icons/workflow/Delete'
import CancelIcon from '@spectrum-icons/workflow/Cancel'

export const initDetail: iTrxDetail = {
  id: 0,
  accCodeId: 0,
  trxId: 0,
  debt: 0,
  cred: 0
}

type TrxDetailFormOptions = {
  detail: iTrxDetail,
  accs: iAccCodeType[],
  isNew: boolean,
  callback: (params: { method: string, data?: iTrxDetail }) => void
}

const TrxDetailForm = (props: TrxDetailFormOptions) => {
  const { detail, callback, isNew, accs } = props;
  const [data, setData] = React.useState<iTrxDetail>(initDetail)
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  const isCodeValid = React.useMemo(
    () => data.accCodeId > 0,
    [data]
  )

  const isDebtValid = React.useMemo(
    () => data.debt >= 0,
    [data]
  )

  const isCredValid = React.useMemo(
    () => data.cred >= 0,
    [data]
  )

  const isSaldoValid = React.useMemo(
    () => {
      if (data.cred === 0) {
        return data.debt > 0
      }
      if (data.debt === 0) {
        return data.cred > 0
      }
      return false
    },
    [data]
  )

  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(isNew ? { ...initDetail, trxId: detail.trxId } : detail)
    }

    return () => { isLoaded = false }
  }, [detail, isNew])

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex rowGap='size-50' direction={'column'} marginTop={'size-50'}>
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
          <ComboBox
            flex
            menuTrigger='focus'
            validationState={isCodeValid ? "valid" : "invalid"}
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
            validationState={isDebtValid ? 'valid' : 'invalid'}
            width={{ base: "auto", L: '150px' }}
            aria-label={"debet-akun"}
            onChange={(e) => changeData("debt", e)}
            value={data.debt} />
          <NumberField
            hideStepper={true}
            validationState={isCredValid ? 'valid' : 'invalid'}
            width={{ base: "auto", L: '150px' }}
            aria-label={"cred-akun"}
            onChange={(e) => changeData("cred", e)}
            value={data.cred} />
          <Flex direction={'row'} columnGap='size-50' alignSelf={'flex-end'}>
            <Button type='submit' variant='secondary' isDisabled={!isDirty || !(isCodeValid && isSaldoValid)}>
              <SaveIcon size='S' />
            </Button>
            <Button type='button' variant='secondary' onPress={() => callback({method: 'cancel', data: detail })}>
              <CancelIcon size='S' /></Button>
            <Button type='button'
              isDisabled={data.id === 0}
              variant='secondary'
              onPress={() => callback({ method: "delete", data: data })}>
              <Removecon size='S' />
              </Button>
          </Flex>
        </Flex>

      </Flex>
    </form>
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isCodeValid && isSaldoValid) {

      if (isNew) {
        callback({ method: "insert", data: data });
      } else {
        callback({ method: "update", data: data });
      }
    }
  }

  function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

}

export default TrxDetailForm;