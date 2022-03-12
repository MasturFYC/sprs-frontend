import React, { FormEvent, useState } from 'react';
import axios from '../../lib/axios-base';
import { iTrx,  dateParam,  dateOnly, iAccCode, iTrxDetail } from '../../lib/interfaces'
import {
  Button, ComboBox, Flex, Heading,
  NumberField, Item, Text,
  TextArea, TextField, View
} from '@adobe/react-spectrum';
// import { createToken } from '../../lib/format';
import { useNavigate, useParams } from 'react-router-dom';


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

const TrxForm = () => {
  const { trxId } = useParams();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<iAccCode[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0)
  //const [account, setAccount] = useState<iAccCode>(initAccCode)
  const [cashId, setCashId] = useState<number>(0)

  const [trx, setTrx] = useState<iTrx>(initTrx)
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const isDescriptionsValid = React.useMemo(
    () => trx.descriptions.length > 5,
    [trx]
  )
  
  const isAccValid = React.useMemo(
    () => cashId > 0,
    [cashId]
  )

  const isNominalValid = React.useMemo(
    () => trx.saldo > 0,
    [trx]
  )

  React.useEffect(() => {
    let isLoaded = false;

    async function loadAccounts(id: number) {
      const headers = {
        'Content-Type': 'application/json'
      }
      await axios
        .get(`/acc-code/`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          setAccounts(data)
          //setAccount(data.filter((c: iAccCode) => c.id === id)[0])
        })
        .catch(error => {
          console.log({ 'Error': error })
          return []
        })
    }

    if (!isLoaded && trxId) {
      setTrx(initTrx)
      const id = +trxId;
      loadAccounts(id)
      setSelectedId(id)
      setCashId(0)
    }
    return () => { isLoaded = true }
  }, [trxId])


  function SetTitle() {
    const acc = accounts && accounts.filter(f => f.id === selectedId)[0]

    if (acc) {
      return (
        <View marginBottom={'size-200'}>
          <Heading level={1}>
            {acc.name}
          </Heading>
          <View>{acc.descriptions}</View>
        </View>
      )
    }

    return <div></div>

  }

  return (
    <View>
      <SetTitle />
      <form onSubmit={(e) => handleSubmit(e)}>
        <Flex rowGap='size-50' direction={'column'}>
          <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
            <TextField
              type={'date'}
              label='Tanggal transaksi'
              width={{ base: 'auto', M: 'size-2000' }}
              value={dateOnly(trx.trxDate)}
              maxLength={10}
              onChange={(e) => {
                setTrx(o =>({...o, trxDate: e}))
                setIsDirty(true)
              }}
            />
            <TextField
              flex
              label='Keterangan'
              autoFocus
              width={{ base: 'auto' }}
              validationState={isDescriptionsValid ? 'valid' : 'invalid'}
              placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
              value={trx.descriptions}
              maxLength={128}
              onChange={(e) => {
                setIsDirty(true)
                setTrx(o =>({...o, descriptions: e}))
              }}
            />
          </Flex>
          <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>

            <NumberField
              hideStepper={true}
              width={{ base: 'auto', M: 'size-2000' }}
              label={"Jumlah transaksi"}
              onChange={(e) => {
                setIsDirty(true)
                setTrx(o =>({...o, saldo: e}))
              }}
              value={trx.saldo} />
            <ComboBox
              flex
              menuTrigger='focus'
              width={'auto'}
              label={"Akun kas yg terlibat transaksi"}
              placeholder={"e.g. Kas / bank"}
              defaultItems={accounts.filter(f => f.typeId === 11)}
              selectedKey={cashId}
              onSelectionChange={(e) => {
                setIsDirty(true)
                setCashId(+e)
              }
              }
            >
              {(item) => <Item textValue={`${item.id} - ${item.name}`}>
                <Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
                <Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
              </Item>}
            </ComboBox>
          </Flex>

          <TextArea
            label='Memo'
            flex
            width={'auto'}
            placeholder={'e.g. Memo'}
            value={trx.memo || ''}
            maxLength={128}
            onChange={(e) => {
              setIsDirty(true)
              
              setTrx(o =>({...o, memo: e}))
            }}
          />
        </Flex>
        <Flex direction={'row'} gap='size-100' marginBottom={'size-100'} marginTop={'size-200'}>
          <Flex flex direction={'row'} columnGap={'size-125'}>
            <Button type='submit' variant='cta'
              isDisabled={!isDirty || !(isDescriptionsValid && isAccValid && isNominalValid)}>Save</Button>
          </Flex>
          <View>
            <Button type='button' variant='primary'>
              {isDirty ? 'Cancel' : 'Close'}</Button>
          </View>
        </Flex>
      </form>

    </View >
  );


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isDescriptionsValid && isAccValid && isNominalValid) {
      saveTransaction(trx);
    }
  }

  function saveTransaction(p: iTrx) {
    const details = createTransactionDetails(p);
    const token = createTransactionToken(p);
    insertTrx(trx, details, token).then(e => {
      navigate('/trx')
    })
  }

  function createTransactionToken(p: iTrx): string {
    let s: string[] = []

    s.push(p.descriptions);
    if(p.memo && p.memo.length > 0) {
      s.push(p.memo);
    }

    s.push('/id-' + p.id)
    s.push(p.division)

    return s.join(" ");
  }  
  async function insertTrx(trx: iTrx, details: iTrxDetail[], token: string) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify({
      trx: trx,
      details: details,
      token: token
    })

    let res = await axios
      .post(`/trx/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        if (data) {
          return data
        }
      })
      .catch(error => {
        console.log(error)
      })

      if(res) return true
      return false
  }


  function createTransactionDetails(p: iTrx): iTrxDetail[] {
    const details: iTrxDetail[] = [];

    details.push({
      id: 1,
      codeId: cashId, // Bank BCA
      trxId: 0,
      debt: 0,
      cred: p.saldo
    })
    details.push({
      id: 2,
      codeId: selectedId, // Order (SPK)
      trxId: 0,
      debt: p.saldo,
      cred: 0
    })

    return details;
  }  

}

export default TrxForm;