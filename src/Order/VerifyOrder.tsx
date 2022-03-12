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
    const trx = createTransaction(p);
    const details = createTransactionDetails(p);
    const token = createTransactionToken(p);
    insertTrx(trx, details, token);
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

    await axios
      .post(`/trx/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        if (data) {

        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  function createTransactionToken(p: iOrder): string {
    let s: string[] = []

    s.push('/' + p.name);

    if (p.unit && p.unit.type && p.unit.type.merk && p.unit.type.wheel) {
      s.push(p.unit.type.wheel.shortName);
      s.push(p.unit.type.merk.name);
      s.push(p.unit.type.name);
      s.push(p.unit.nopol);
    }

    if (p.customer && p.customer.name.length > 0) {
      s.push(p.customer.name);
    }

    if (p.finance) {
      s.push(p.finance.name);
      s.push(p.finance.shortName);
    }

    if (p.branch) {
      s.push(p.branch.name);
      s.push(p.branch.headBranch);
    }

    s.push('/ref-' + p.id)
    s.push('TRX-Order')

    return s.join(" ");
  }

  function createTransactionDetails(p: iOrder): iTrxDetail[] {
    const details: iTrxDetail[] = [];

    let stnk = 0; //, ppn = 0;

    // if (p.nominal > 0) {
    //   ppn = p.nominal;
    // }
    if (p.stnkPrice > 0) {
      stnk = p.stnkPrice;
    }

    details.push({
      id: 1,
      codeId: 1112, // Bank BCA
      trxId: 0,
      debt: 0,
      cred: p.btMatel
    })

    // if (ppn > 0) {
    //   details.push({
    //     id: 2,
    //     accCodeId: 1113, // Utang Pajak
    //     trxId: 0,
    //     debt: 0,
    //     cred: ppn
    //   })
    // }

    details.push({
      id: 2,
      codeId: 1211, // Order (SPK)
      trxId: 0,
      debt: p.btMatel - stnk,
      cred: 0
    })

    if (stnk > 0) {
      details.push({
        id: 3,
        codeId: 5211, // Biaya STNK
        trxId: 0,
        debt: stnk,
        cred: 0
      })
    }

    return details;
  }

  function createTransaction(p: iOrder): iTrx {
    const initTrx: iTrx = {
      id: 0,
      refId: p.id,
      division: 'TRX-Order',
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
    let memo: string = 'Kendaraan ';
    if (p.unit && p.unit.type && p.unit.type.merk && p.unit.type.wheel) {
      memo += p.unit.type.wheel.shortName + ' ';
      memo += p.unit.type.merk.name + ' ';
      memo += p.unit.type.name + ' ';
      memo += ', Nopol ' + p.unit.nopol;
    }

    if (p.customer && p.customer.name.length > 0) {
      memo += ', atas nama ' + p.customer.name;
    }

    return memo;
  }

  // function isVerified(verifyName?: string): boolean {
  //   if (verifyName) {
  //     return verifyName.length > 0
  //   }
  //   return false;
  // }

  function getFinanceName(p?: iFinance): string {
    if (p) {
      return p.name + ' (' + p.shortName + ')'
    }
    return ''
  }
}
