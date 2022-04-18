import React, { useState } from 'react';
import axios from 'lib/axios-base';
import { iTrx, dateParam, iAccCode, iTrxDetail } from 'lib/interfaces'
import {
  Flex,
  View, Divider
} from '@adobe/react-spectrum';
import { useNavigate, useParams } from 'react-router-dom';
import RemainSaldo from '../saldo';
import TrxAutoDebetForm from './form';
import { useAccountCash } from 'lib/useAccountCash';
import WaitMe from 'component/waitme';


interface accountInfo extends iAccCode {
  typeName: string
  typeDesc?: string
  groupName: string
  groupDesc?: string
}

const initAccountInfo: accountInfo = {
  typeName: '',
  groupName: '',
  id: 0,
  name: '',
  typeId: 0,
  isActive: false,
  isAutoDebet: false,
  option: 0
}

export const initTrx: iTrx = {
  id: 0,
  refId: 0,
  division: 'trx-auto',
  trxDate: dateParam(null),
  descriptions: '',
  memo: '',
  saldo: 0,
  details: []
}

const TrxAutoDebet = () => {
  const { trxId } = useParams();
  const [account, setAccount] = useState<accountInfo>({} as accountInfo)
  const trx = initTrx;
  const navigate = useNavigate();


  const accountCashes = useAccountCash();

  React.useEffect(() => {
    let isLoaded = false;

    async function loadAccount(id: string) {
      const headers = {
        'Content-Type': 'application/json'
      }
      const res = await axios
        .get(`/acc-code/item/${id}`, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return res ? res : initAccountInfo
    }

    if (trxId) {
      loadAccount(trxId).then(data => {
        if (!isLoaded) {
          setAccount(data)
        }
      })
    }
    return () => { isLoaded = true }
  }, [trxId])

  if (accountCashes.isLoading) {
    return <WaitMe />
  }

  function SetTitle() {

    if (account) {
      return <>
        <Flex direction={{ base: 'column', M: 'row' }} alignItems={'center'} marginBottom={'size-200'} columnGap={'size400'} rowGap={'size-100'}>
          <View alignSelf={"flex-end"} flex><span className='div-h1'>{account.name}</span></View>
          <View justifySelf={'center'} alignSelf={"start"}><RemainSaldo /></View>
        </Flex>
        <View>
          {account.descriptions}
          {'. '}<i>{account.name}</i>
          {' merupakan '}<b>{account.typeName}</b>
          {' yaitu '}{account.typeDesc},
          {' '}<b>{account.groupName}</b>
          {' adalah '}{account.groupDesc}
        </View>

      </>
    }
    return <></>
  }

  return (
    <View>
      <View flex>
        <SetTitle />
      </View>
      <Divider size='M' marginY={'size-200'} />

      <TrxAutoDebetForm
        accountCashes={accountCashes.items}
        onCancle={() => navigate('/trx')}
        trx={trx}
        onSave={(cashId, data) => saveTransaction(cashId, data)}
        onSaveAndCreate={(id, data) => saveTransaction(id, data, true)}
      />

    </View >
  );


  function saveTransaction(cashId: number, p: iTrx, createNewOne = false) {
    const details = createTransactionDetails(cashId, p);
    const token = createTransactionToken(p);
    insertTrx(p, details, token).then(e => {
      if (!createNewOne) {
        navigate('/trx')
      }
    })
  }

  function createTransactionToken(p: iTrx): string {
    const s: string[] = []

    s.push(p.descriptions);
    if (p.memo && p.memo.length > 0) {
      s.push(p.memo);
    }

    s.push('/id-' + p.id)
    s.push(p.division)

    return s.join(" ");
  }

  async function insertTrx(p: iTrx, details: iTrxDetail[], token: string) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify({
      trx: p,
      details: details,
      token: token
    })


    const res = await axios
      .post(`/trx`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        if (data) {
          return data
        }
      })
      .catch(error => {
        console.log(error)
      })

    if (res) return true
    return false
  }

  function createTransactionDetails(cashId: number, p: iTrx): iTrxDetail[] {
    const details: iTrxDetail[] = [];

    const index1 = account.option === 3 ? 2 : 1;
    const index2 = account.option === 3 ? 1 : 2;
    const debt = account.option === 3 ? 0 : p.saldo;
    const cred = account.option === 3 ? p.saldo : 0;

    details.push({
      id: index1,
      codeId: cashId, // Bank BCA
      trxId: 0,
      debt: debt,
      cred: cred
    })
    details.push({
      id: index2,
      codeId: account.id, // Order (SPK)
      trxId: 0,
      debt: cred,
      cred: debt
    })

    return details;
  }
}

export default TrxAutoDebet;