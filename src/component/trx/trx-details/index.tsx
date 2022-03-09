import React, { useState } from "react";
import axios from "../../../lib/axios-base";
import { iAccCodeType, iTrxDetail } from '../../../lib/interfaces'
import { View } from "@react-spectrum/view";
import TrxDetailForm, { initDetail } from './form'
import { Link, useAsyncList, Flex, Divider, ActionButton } from "@adobe/react-spectrum";
import { FormatNumber } from "../../../lib/format";
import AddIcon from '@spectrum-icons/workflow/Add'
import SaveIcon from '@spectrum-icons/workflow/Checkmark'
import Removecon from '@spectrum-icons/workflow/Remove'
import CancelIcon from '@spectrum-icons/workflow/Cancel'

type TrxDetailsParam = {
  trxId: number,
  accs: iAccCodeType[],
  detailCallback: (d: number, c: number, arr: iTrxDetail[]) => void
}
const TrxDetails = (props: TrxDetailsParam) => {
  const { accs, trxId, detailCallback } = props;
  const [selectedId, setSelectedId] = useState<number>(-1)
  const [detail, setDetail] = useState<iTrxDetail>({} as iTrxDetail);

  let details = useAsyncList<iTrxDetail>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/trx-detail/${trxId}/`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
          return []
        })

      return { items: res }
    },
    getKey: (item: iTrxDetail) => item.id
  })

  return (
    <View paddingY={'size-50'} paddingX={'size-200'} backgroundColor={'gray-50'}>
      <ShowHeader />
      {[...details.items].map((o, i) => {
        return o.id === selectedId ?
          <React.Suspense key={`${o.id + i}`} fallback={<div>Please wait...</div>}>
            <TrxDetailForm              
              accs={accs.filter(o => o.isActive)}
              data={detail}
              changeData={changeData}
            >
              <View paddingTop={'size-50'}>
                <ActionButton isQuiet height={'size-200'}
                  onPress={() => saveDetail('save', detail)}>
                  <SaveIcon size='M' />
                </ActionButton>
                <ActionButton isQuiet height={'size-200'}
                  marginStart={'size-100'}                  
                  onPress={() => setSelectedId(0)}>
                  <CancelIcon size='M' />
                </ActionButton>
              </View>
            </TrxDetailForm>
          </React.Suspense>
          :
          <ShowDetail key={`${o.id + i}`} getCodeName={getCodeName}
            detail={o} setSelected={(e) => {
              setSelectedId(e);
              details && details.getItem(e) && setDetail(details.getItem(e))
            }}>
            <View>
              <ActionButton isQuiet
                onPress={() => saveDetail('remove', details.getItem(o.id))}
                height={'size-200'}
              >
                <Removecon size='S' marginBottom={'size-100'} />
              </ActionButton>
            </View>
          </ShowDetail>
      })}
      <View marginTop={'size-100'}>
        <ActionButton height={'size-200'} isQuiet onPress={() => addNewItem()}><AddIcon size='S' /></ActionButton>
      </View>
    </View>
  );

  function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
    const detailUpdate = { ...detail, [fieldName]: value }
    setDetail(o => (detailUpdate))
    //setIsDirty(true)
  }

  //   details.update(detail.id, detail)
  //   setSelectedId(0);
  //   if(details.items && details.items.length > 0) {
  //   const debt = details.items.reduce((a,b)=> a + b.debt,0)
  //   const cred = details.items.reduce((a,b)=> a + b.cred,0)
  //   //console.log((debt > 0) && (cred > 0) && (debt - cred) === 0);
  //   detailCallback((debt > 0) && (cred > 0) && (debt - cred) === 0);
  //   }
  // }

  function getCodeName(id: number) {
    const c = accs.filter(o => o.id === id)[0];
    return c ? `${c.id} - ${c.name}` : '---'
  }

  function saveDetail(method: string, p: iTrxDetail) {

    const test = [...details.items.filter(o => o.id !== 0)];
    let i = -1;
    for (var c = 0; c < test.length; c++) {
      if (test[c].id === p.id) {
        i = c;
        break;
      }
    }

    switch (method) {
      case 'save':
        test.splice(i, 1, p);
        details.update(p.id, p);
        break;
      case 'remove':
        test.splice(i, 1);
        details.remove(p.id);
        break;
    }

    const debt = test.reduce((a, b) => a + b.debt, 0);
    const cred = test.reduce((a, b) => a + b.cred, 0);
    detailCallback(debt, cred, test);


    setSelectedId(0);

  }

  function addNewItem() {
    const i = (details.items.length > 0) ? details.items[details.items.length - 1].id + 1 : 1
    const d = { ...initDetail, id: i, trxId: trxId };
    setDetail(d)
    details.append(d);
    setSelectedId(i)
  }
}

function ShowHeader() {
  return <View>
    <Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-100'} rowGap={'size-150'}>
      <View flex>KETERANGAN</View>
      <View width={'size-2000'}>DEBET</View>
      <View width={'size-2000'}>KREDIT</View>
      <View width={'size-1600'}>COMMAND</View>
    </Flex>
    <Divider size="S" marginY={'size-50'} />
  </View>;
}

type ShowDetailParam = {
  getCodeName: (id: number) => string,
  setSelected: (id: number) => void,
  detail: iTrxDetail,
  children: JSX.Element
}

function ShowDetail(props: ShowDetailParam): JSX.Element {
  const { getCodeName, children, setSelected, detail: o } = props;

  return (<View marginY='size-100'>
    <Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-100'} rowGap={'size-25'}>
      <View flex>
        <Link isQuiet flex={'none'} variant="primary"
          UNSAFE_className={'font-bold'}
          onPress={() => setSelected(o.id)}>
          <div>{getCodeName(o.accCodeId)}</div>
        </Link>
      </View>
      <View width={'size-2000'}>{FormatNumber(o.debt)}</View>
      <View width={'size-2000'}>{FormatNumber(o.cred)}</View>
      <View width={'size-1600'}>{children}</View>
    </Flex>
    <Divider size="S" marginTop="size-100" />
  </View>
  );

}

export default TrxDetails;

