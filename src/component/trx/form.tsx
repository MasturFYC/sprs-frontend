import React, { FormEvent, useState } from 'react';
import axios from '../../lib/axios-base';
import { iTrx, iAccCodeType, dateParam, iAccType, dateOnly, iTrxDetail } from '../../lib/interfaces'
import {
  Button, ComboBox, Flex, Heading, Item,
  Text,
  TextArea, TextField, View
} from '@adobe/react-spectrum';
import TrxDetails from './trx-details';

export const initTrx: iTrx = {
  id: 0,
  trxTypeId: 0,
  refId: 0,
  division: 'TRX-Umum',
  trxDate: dateParam(null),
  descriptions: '',
  memo: '',
  saldo: 0,
  details: []
}

type TrxFormOptions = {
  trx: iTrx,
  accs: iAccCodeType[],
  types: iAccType[],
  isNew: boolean,
  callback: (params: { method: string, data?: iTrx }) => void
}

const TrxForm = (props: TrxFormOptions) => {
  const { trx, callback, isNew, types, accs } = props;
  const [data, setData] = React.useState<iTrx>(initTrx)
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [debt, setDebt] = useState<number>(0);
  const [cred, setCred] = useState<number>(0);
  const [details, setDetails] = useState<iTrxDetail[]>([]);

  const isTypeValid = React.useMemo(
    () => data.trxTypeId > 0,
    [data]
  )

  const isBalancedValid = React.useMemo(
    () => data.saldo > 0 && (debt - cred) === 0,
    [debt, cred, data]
  )

  const isDescriptionsValid = React.useMemo(
    () => data.descriptions.length > 10,
    [data]
  )

  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(trx)
    }

    return () => { isLoaded = false }
  }, [trx])

  return (
    <View>
      <form onSubmit={(e) => handleSubmit(e)}>
        <Flex direction={'row'} gap='size-100' marginBottom={'size-100'} marginTop={'size-50'}>
          <Flex flex direction={'row'} columnGap={'size-125'}>
            <Button type='submit' variant='cta'
              isDisabled={!isBalancedValid || !isDirty || !(isDescriptionsValid && isTypeValid)}>Save</Button>
            <Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
              {isDirty ? 'Cancel' : 'Close'}</Button>
          </Flex>
          <View alignSelf={'center'} flex UNSAFE_className='font-bold'>Transaksi #{data.id}</View>
          <View>
            <Button type='button' alignSelf={'flex-end'}
              isDisabled={data.id === 0}
              variant='negative'
              onPress={() => deleteTrx(data)}>Remove</Button>
          </View>
        </Flex>

        <Flex rowGap='size-50' direction={'column'}>
          <TextField
            flex
            label='Keterangan'
            autoFocus
            width={'auto'}
            validationState={isDescriptionsValid ? 'valid' : 'invalid'}
            placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
            value={data.descriptions}
            maxLength={128}
            onChange={(e) => changeData("descriptions", e)}
          />

          <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
            <TextField
              type={'date'}
              label='Tanggal transaksi'
              width={{ base: 'auto', M: '25%' }}
              value={dateOnly(data.trxDate)}
              maxLength={10}
              onChange={(e) => changeData("trxDate", e)}
            />
            <ComboBox
              flex
              menuTrigger='focus'
              validationState={isTypeValid ? "valid" : "invalid"}
              width={'auto'}
              label={"Jenis transaksi"}
              placeholder={"e.g. Pendapatan"}
              defaultItems={types}
              selectedKey={data.trxTypeId}
              onSelectionChange={(e) => changeData("trxTypeId", +e)}
            >
              {(item) => <Item textValue={`${item.id} - ${item.name}`}>
                <Text><span style={{ fontWeight: 700 }}>{item.id} - {item.name}</span></Text>
                <Text slot='description'>
                  {item.descriptions}
                </Text>
              </Item>}
            </ComboBox>
          </Flex>
          <Flex direction={'column'} alignContent={'center'}>
            <Heading level={5}>Detail transaksi</Heading>
            <View marginY={'size-50'}>
              <TrxDetails
                accs={accs}
                trxId={trx.id}
                detailCallback={(d, c, arr) => {
                  setDebt(d);
                  setCred(c);
                  setDetails(arr)
                  changeData("saldo", d)
                }}
              />
            </View>
          </Flex>
          <TextArea
            label='Memo'
            flex
            width={'auto'}
            placeholder={'e.g. Memo'}
            value={data.memo || ''}
            maxLength={128}
            onChange={(e) => changeData("memo", e)}
          />
        </Flex>
      </form>
    </View>
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isTypeValid && isDescriptionsValid) {

      if (isNew) {
        await insertTrx(data);
      } else {
        await updateTrx(data);
      }
    }
  }

  async function updateTrx(p: iTrx) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify({ ...p, details: details })

    await axios
      .put(`/trx/${trx.id}/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        callback({ method: 'save', data: p })
      })
      .catch(error => {
        console.log(error)
      })
  }

  async function insertTrx(p: iTrx) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify({ ...p, details: details })

    await axios
      .post(`/trx/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        setData(o => ({ ...o, id: data.id }))
        callback({ method: 'save', data: { ...p, id: data.id } })
      })
      .catch(error => {
        console.log(error)
      })
  }


  async function deleteTrx(p: iTrx) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    await axios
      .delete(`/trx/${p.id}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        callback({ method: 'remove', data: p })
      })
      .catch(error => {
        console.log(error)
      })
  }

  function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

}

export default TrxForm;