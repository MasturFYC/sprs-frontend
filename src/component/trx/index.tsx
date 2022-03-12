import React, { useState } from "react";
import axios from "../../lib/axios-base";
import { iAccCodeType, iTrx, iAccGroup } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, Divider, Heading, Flex, Link, ProgressCircle, SearchField, Text, useAsyncList } from "@adobe/react-spectrum";
import { initTrx } from './form'
import { FormatDate, FormatNumber } from "../../lib/format";
import MonthComponent from "../Bulan";
import RemainSaldo from '../saldo';

const TrxForm = React.lazy(() => import('./form'));

const Trx = () => {
  //let { trxId } = useParams();
  const [selectedId, setSelectedId] = React.useState<number>(-1);
  const [txtSearch, setTxtSearch] = useState<string>('');
  const [bulan, setBulan] = useState<number>(0);
  //const navigate = useNavigate();

  let accs = useAsyncList<iAccCodeType>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/acc-code/props/", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iAccCodeType) => item.id
  })

  let types = useAsyncList<iAccGroup>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/acc-group/", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iAccGroup) => item.id
  })


  let trxs = useAsyncList<iTrx>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/trx/", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data;
        })
        .catch(error => {
          console.log('-------', error)
          return [];
        })

      return { items: res }
    },
    getKey: (item: iTrx) => item.id
  })

  // React.useEffect(() => {
  //   let isLoaded = false

  //   if (!isLoaded && trxId) {
  //       setSelectedId(+trxId);
  //   }

  //   return () => { isLoaded = true; }

  // }, [trxId])

  if (accs.isLoading || types.isLoading || trxs.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <Flex direction={{ base: 'column', M: 'row' }}>
        <View alignSelf={"center"} flex><Heading level={1}>Transaksi</Heading></View>
        <View alignSelf={"center"}><RemainSaldo /></View>
      </Flex>
      <Flex direction={{ base: 'column', M: 'row' }} gap='size-200'
        marginY={'size-200'}>
        <Button variant="cta" onPress={() => addNewItem()}>Transaksi Baru</Button>
        <SearchField
          type="search"
          aria-label="trx-search-transaction"
          flex
          width={'auto'}
          value={txtSearch}
          placeholder={'e.g. invoic | rokok | kopi | kris'}
          //validationState={txtSearch.length > 2 ? 'valid' : 'invalid'}
          maxLength={50}
          onClear={() => {
            loadAllCodes();
          }}
          onSubmit={(e) => {
            searchTransact(e)
          }}
          onChange={(e) => setTxtSearch(e)}
        />
        <MonthComponent width="125px" selectedId={bulan}
          onChange={(e) => {
            setBulan(e.id);
            if (e.id > 0) {
              getTransactionByMonth(e.id)
            } else {
              loadAllCodes();
            }
          }} />

        {/* {selectedId > 0 &&
          <TrxForm
            isNew={selectedId === 0}
            accs={accs.items}
            trx={trxs.getItem(selectedId)}
            types={types.items}
            callback={(e) => formResponse(e)}
          />} */}
      </Flex>
      {trxs.items.map(o => {

        return o.id === selectedId ?
          <View key={o.id}
            backgroundColor={'gray-100'}
            borderRadius={'medium'}
            borderColor={'indigo-400'}
            borderWidth={'thin'}
            paddingX={'size-200'}
            paddingTop={'size-50'}
            paddingBottom={'size-200'}
            marginBottom={'size-200'}
          >
            <TrxForm
              isNew={o.id === 0}
              accs={accs.items}
              trx={o}
              callback={(e) => formResponse(e)}
            />
          </View>
          :
          <View key={o.id}>
            <View backgroundColor={'gray-100'} padding={'size-100'}>
              <Flex flex direction={'row'} columnGap='size-200'>
                <View flex width={'auto'}>
                  {o.refId === 0
                    ?
                    <Link isQuiet UNSAFE_className="font-bold" onPress={() => setSelectedId(o.id)}><span>#{o.id} - {o.descriptions}</span></Link>
                    :
                    <span className='font-bold'>#{o.id} - {o.descriptions}</span>
                  }
                </View>
                {/* <View borderRadius={'large'} paddingTop={'size-25'} paddingBottom={'size-50'} paddingX={'size-100'}
                  justifySelf={'center'}
                  alignSelf={"center"}
                  backgroundColor={o.refId > 0 ? 'gray-400' : (o.groupId === 2 ? 'red-700' : o.groupId === 3 ? 'green-700' : 'gray-50')}>
                  <span style={{ padding: '6px', color: o.groupId === 1 ? '#000000' : '#ffffff' }}>{o.groupId > 0 ? types.getItem(o.groupId).name : ''}</span>
                </View> */}
              </Flex>
            </View>
            <View padding={'size-100'}>
              <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-400'}>
                <Flex flex direction={'column'} rowGap='size-50'>
                  <Flex flex direction={{ base: 'row', M: 'column' }} columnGap='size-100' rowGap='size-50'>
                    <View flex>{FormatDate(o.trxDate)}</View>
                    <View>Saldo: <b>{FormatNumber(o.saldo)}</b><br /></View>
                  </Flex>
                  <View>Memo: {o.memo || ''}</View>
                </Flex>
                <View width={{ base: 'auto', M: '70%' }}>
                  <View isHidden={{ base: true, M: false }}>
                    <ShowHeader />
                    <Divider flex size="S" />
                    {
                      o.details && o.details.map(item => <OrderDetail key={item.id} detail={item} />)
                    }
                  </View>
                </View>
              </Flex>
            </View>
          </View>
      })}
      {/* Summary(getTotalTransaction) */}

    </View >
  );

  // function getTotalTransaction(typeId: number): string {
  //   const value = trxs.items.filter(o => o.groupId === typeId).reduce((t, c) => t + c.saldo, 0)
  //   // const debt = trxs.items.filter(o=>o.trxTypeId===1).reduce((t,c)=>t+c.saldo,0)
  //   // const cred = trxs.items.filter(o=>o.trxTypeId===2).reduce((t,c)=>t+c.saldo,0)

  //   return FormatNumber(value)
  // }

  function formResponse(params: { method: string, data?: iTrx }) {
    const { method, data } = params
    //navigate('/trx')

    switch (method) {
      case 'save':
        if (data) {
          if (selectedId === 0) {
            trxs.update(0, data)
          } else {
            trxs.update(selectedId, data)
            setSelectedId(-1)
            return;
          }
        }
        break;
      case 'remove':
        trxs.remove(selectedId);
        break;
      case 'cancel':
        //navigate('/trx/-1')
        if (selectedId === 0) {
          trxs.remove(0)
        }
        break;
    }

    setSelectedId(-1)
  }

  function addNewItem() {
    if (!trxs.getItem(0)) {
      trxs.insert(0, initTrx);
    }
    setSelectedId(0)
    //navigate('/trx/0')
  }

  async function searchTransact(e: string) {

    const headers = {
      'Content-Type': 'application/json'
    }

    //const txt = e.replace(/ /g, ' | ')

    let res = await axios
      .post(`/trx/search/`, { txt: e }, { headers: headers })
      .then(response => response.data)
      .then(data => {
        return data ? data : []
      })
      .catch(error => {
        console.log('-------', error)
        return []
      })

    trxs.setSelectedKeys('all')
    trxs.removeSelectedItems();
    trxs.append(...res);

  }

  async function getTransactionByMonth(id: number) {
    const headers = {
      'Content-Type': 'application/json'
    }

    let res = await axios
      .get(`/trx/month/${id}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        return data ? data : []
      })
      .catch(error => {
        console.log('-------', error)
        return []
      })

    trxs.setSelectedKeys('all')
    trxs.removeSelectedItems();
    trxs.append(...res);
  }

  async function searchTransactByType(id: number) {

    const headers = {
      'Content-Type': 'application/json'
    }

    let res = await axios
      .get(`/trx/group-type/${id}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        return data ? data : []
      })
      .catch(error => {
        console.log('-------', error)
        return []
      })

    trxs.setSelectedKeys('all')
    trxs.removeSelectedItems();
    trxs.append(...res);
  }

  async function loadAllCodes() {

    const headers = {
      'Content-Type': 'application/json'
    }

    let res = await axios
      .get(`/trx/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        return data ? data : []
      })
      .catch(error => {
        console.log('-------', error)
        return []
      })

    trxs.setSelectedKeys('all')
    trxs.removeSelectedItems();
    trxs.append(...res);
  }

}

type OrderDetailProp = {
  detail: {
    id: number
    name: string
    debt: number
    cred: number
  }
}

// function Summary(getTotalTransaction: (typeId: number) => string) {
//   return (<View marginY={'size-400'}>
//     <Divider size='M' marginY={'size-200'} />
//     <View UNSAFE_className="font-bold">Summary:</View>
//     <Flex width={{ base: 'auto', M: 'size-3400' }} direction={'column'}>
//       <Flex direction={'row'}>
//         <View flex>Financing:</View>
//         <View width={'size-2000'} UNSAFE_className="font-bold text-right">{getTotalTransaction(3)}</View>
//       </Flex>
//       <Flex direction={'row'}>
//         <View flex>Pendapatan:</View>
//         <View width={'size-2000'} UNSAFE_className="font-bold text-right">{getTotalTransaction(1)}</View>
//       </Flex>
//       <Flex direction={'row'}>
//         <View flex>Pengeluaran:</View>
//         <View width={'size-2000'} UNSAFE_className="font-bold text-right">{getTotalTransaction(2)}</View>
//       </Flex>
//     </Flex>
//   </View>);
// }

function OrderDetail(props: OrderDetailProp) {
  const { detail: p } = props;
  return (
    <Flex direction={{ base: 'column', M: 'row' }} marginBottom={'size-50'}>
      <Flex flex direction={'row'} columnGap={'size-200'}>
        <View>{p.id}</View>
        <View flex>{p.name}</View>
      </Flex>
      <Flex direction={'row'} columnGap={'size-200'} width={{ base: 'auto', M: '50%' }}>
        <View width={{ base: '50%' }} UNSAFE_className={'text-right'}>{FormatNumber(p.debt)}</View>
        <View width={{ base: '50%' }} UNSAFE_className={'text-right'}>{FormatNumber(p.cred)}</View>
      </Flex>
    </Flex>
  )
}

function ShowHeader() {
  return <Flex direction={{ base: 'column', M: 'row' }}
    marginBottom={{ base: 'size-100', M: 'size-50' }}>
    <View flex>DESKRIPSI</View>
    <Flex direction={'row'} columnGap={'size-200'} width={{ base: 'auto', M: '50%' }}>
      <View width={{ base: '50%' }} UNSAFE_className={'text-right'}>DEBET</View>
      <View width={{ base: '50%' }} UNSAFE_className={'text-right'}>KREDIT</View>
    </Flex>
  </Flex>;
}


export default Trx;