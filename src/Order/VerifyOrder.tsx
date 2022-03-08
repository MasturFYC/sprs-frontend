import React from 'react'
import { View } from '@react-spectrum/view'
import axios from '../lib/axios-base'
import { dateParam, iFinance, iOrder, iTrx, iTrxDetail } from '../lib/interfaces';
import { ActionButton, Button, ButtonGroup, Content, Dialog, DialogTrigger, Divider, Heading, Text } from '@adobe/react-spectrum';
import { FormatNumber } from '../lib/format';
import MarkIcon from '@spectrum-icons/workflow/Checkmark'

type VerifyOrderProps = {
  order: iOrder,
  onChange: (e: string) => void,
  isDisable: boolean
}

export default function VerifyOrder(props: VerifyOrderProps) {
  const { order, onChange, isDisable } = props;
  return (
    <View flex>
      <DialogTrigger>
        <ActionButton isDisabled={isDisable}>
          <MarkIcon />
          <Text>Verify</Text></ActionButton>
        {(close) => (
          <Dialog>
            <Heading>Verifikasi</Heading>
            <Divider />
            <Content>
              Setelah diverifikasi, Order (SPK) dengan nomor <b>{order.name}</b>
              {' '}tidak bisa diubah lagi. Yakinkan semua data sudah valid.<br />
              Jumlah dana yang akan dialokasikan sebesar BT Matel yaitu Rp
              <b>{FormatNumber(order.btMatel)}</b>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="cta" onPress={() => {
                saveTransaction(order);
                onChange('test');
                close()
              }} autoFocus>Confirm</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>      
    </View>
  );

  function saveTransaction(p: iOrder) {
    const trx = createTransaction(p)
    const details = createTransactionDetails(p)
    insertTrx(trx, details)
    //console.log(trx, details)
  }

  async function insertTrx(p: iTrx, d: iTrxDetail[]) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify({ ...p, details: d })

    await axios
      .post(`/trx/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        if(data) {

        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  function createTransactionDetails(p: iOrder): iTrxDetail[] {
    return [
      {
        id: 1,
        accCodeId: 1211,
        trxId: 0,
        debt: p.btMatel,
        cred: 0
      },
      {
        id: 2,
        accCodeId: 1112,
        trxId: 0,
        debt: 0,
        cred: p.btMatel
      }
    ]
  }

  function createTransaction(p: iOrder): iTrx {
    const initTrx: iTrx = {
      id: 0,
      trxTypeId: 2,
      refId: p.id,
      division: 'penarikan',
      trxDate: dateParam(null),
      descriptions: createDescription(p),
      memo: createMemo(p),
      saldo: p.btMatel
    }
    return initTrx;
  }

  function createDescription(p: iOrder) {
    return 'Piutang jasa ' + getFinanceName(p.finance) + ' #Order SPK: ' + p.name
  }

  function createMemo(p: iOrder): string {
    let memo: string = 'Berupa kendaraan ';
    if (p.unit && p.unit.type && p.unit.type.merk && p.unit.type.wheel) {
      memo += '(' + p.unit.type.wheel.shortName + ') ';
      memo += p.unit.type.merk.name + ' ';
      memo += p.unit.type.name + ' ';
      memo += ', Nopol: ' + p.unit.nopol + ' ';
    }

    if (p.customer) {
      memo += ' atas nama ' + p.customer.name;
    }

    return memo;
  }

  function isVerified(verifyName?: string): boolean {
    if (verifyName) {
      return verifyName.length > 0
    }
    return false;
  }

  function getFinanceName(p?: iFinance): string {
    if (p) {
      return p.name + ' (' + p.shortName + ')'
    }
    return ''
  }
}

function FormatNnumber(btMatel: number): React.ReactNode {
  throw new Error('Function not implemented.');
}
