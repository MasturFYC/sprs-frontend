import React, { FormEvent, useState } from 'react';
import axios from '../../lib/axios-base';
import { iTrx, iAccCodeType, dateParam, dateOnly, iTrxDetail, iTrxDetail2 } from '../../lib/interfaces'
import {
  Button, Flex, Heading,
  TextArea, TextField, View
} from '@adobe/react-spectrum';
import TrxDetails from './trx-details';
import { createToken } from '../../lib/format';


export const initTrx: iTrx = {
  id: 0,
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
  isNew: boolean,
  callback: (params: { method: string, data?: iTrx }) => void
}

const TrxForm = (props: TrxFormOptions) => {
  const { trx, callback, isNew, accs } = props;
  const [data, setData] = React.useState<iTrx>(initTrx)
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [debt, setDebt] = useState<number>(0);
  const [cred, setCred] = useState<number>(0);
  const [details, setDetails] = useState<iTrxDetail[]>([]);

  const isBalancedValid = React.useMemo(
    () => data.saldo > 0 && (debt - cred) === 0,
    [debt, cred, data]
  )

  const isDescriptionsValid = React.useMemo(
    () => data.descriptions.length > 5,
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
              isDisabled={!isBalancedValid || !isDirty || !(isDescriptionsValid)}>Save</Button>
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
          <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-100'}>
            <TextField
              type={'date'}
              label='Tanggal transaksi'
              width={{ base: 'auto', M: '25%' }}
              value={dateOnly(data.trxDate)}
              maxLength={10}
              onChange={(e) => changeData("trxDate", e)}
            />
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
    </View >
  );


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isDescriptionsValid) {

      if (isNew) {
        await insertTrx(data);
      } else {
        await updateTrx(data);
      }
    }
  }

  function createIds(): number[] {

    if (details.length > 0) {
      return details.map(o => o.codeId);
    }
    return data.details ? data.details.map(o => o.codeId) : [];
  }

  async function updateTrx(p: iTrx) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const ids = createIds();

    const token = createToken(p, accs, ids);
    const xData = JSON.stringify({
      trx: p,
      details: details,
      token: token
    });

    await axios
      .put(`/trx/${trx.id}/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {

        const newDs: iTrxDetail2[] = [];
        if (details.length > 0) {
          for (let c = 0; c < details.length; c++) {
            const d = details[c];
            newDs.push({ ...d, name: accs.filter(o => o.id === d.codeId)[0].name })
          }
        }
        callback({ method: 'save', data: { ...p, details: newDs } })

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

    const ids = createIds();
    const token = createToken(p, accs, ids);
    const xData = JSON.stringify({
      trx: p,
      details: details,
      token: token
    });

    await axios
      .post(`/trx/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        setData(o => ({ ...o, id: data.id }))
        const newDs: iTrxDetail2[] = [];
        if (details.length > 0) {
          for (let c = 0; c < details.length; c++) {
            const d = details[c];
            newDs.push({ ...d, name: accs.filter(o => o.id === d.codeId)[0].name })
          }
        }
        callback({ method: 'save', data: { ...p, id: data.id, details: newDs } })
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