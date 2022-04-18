import React, { useEffect, useState } from "react";
//import { useNavigate } from 'react-router-dom';
import axios from "../../lib/axios-base";
import { iAccCodeType, iTrx } from 'lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, Divider, Flex, Link, ProgressCircle, SearchField, useAsyncList } from "@adobe/react-spectrum";
import { initTrx } from './form'
import { FormatDate, FormatNumber } from "lib/format";
import MonthComponent from "../Bulan";
import RemainSaldo from '../saldo';
import { useTransactionList, useAccountGroupList } from "lib";
import { PrettyPrintJson } from "lib/utils";

const TrxForm = React.lazy(() => import('./form'));

const Trx = () => {
  //let { trxId } = useParams();
  const [selectedId, setSelectedId] = React.useState<number>(-1);
  //const [txtSearch, setTxtSearch] = useState<string>('');
  const [bulan, setBulan] = useState<number>(0);
  const [isBottom, setBottom] = useState(false)
  const [lastPage, setLastPage] = useState(0)
  //const navigate = useNavigate();

  const accs = useAsyncList<iAccCodeType>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      const res = await axios
        .get("/acc-code/props", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data
        })
        .catch(error => {
          console.log(error)
        })

      return { items: res ? res : [] }
    },
    getKey: (item: iAccCodeType) => item.id
  })

  const groups = useAccountGroupList() 
  const trx = useTransactionList();

  useEffect(() => {
    const onScroll = function () {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight-1) {
        //console.log("you're at the bottom of the page")
        setLastPage(prev => (prev + 10))
        setBottom(false)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let loadMore = false;

    if(!loadMore) {
      setBottom(true)
    }

    return () => {loadMore = true}
  }, [lastPage])

  if (accs.isLoading || groups.isLoading || trx.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (<View>
    <Flex direction={{ base: 'column', M: 'row' }}>
      <View alignSelf={"center"} flex><span className='div-h1'>Ledger</span></View>
      <View alignSelf={"center"}><RemainSaldo /></View>
    </Flex>
    <Flex direction={{ base: 'column', M: 'row' }} gap='size-200'
      marginY={'size-200'}>
      <Button variant="cta" onPress={() => addNewItem()}>Transaksi Baru </Button>
      <SearchField
        type="search"
        aria-label="trx-search-transaction"
        flex
        width={'auto'}
        //defaultValue={txtSearch}
        placeholder={'e.g. invoic | rokok | kopi | kris'}
        //validationState={txtSearch.length > 2 ? 'valid' : 'invalid'}
        maxLength={50}
        onClear={() => {
          trx.reload()
        }}
        onSubmit={(e) => {
          trx.search(e)
        }}
        //onChange={(e) => setTxtSearch(e)}
      />
      <MonthComponent width="200px" selectedId={bulan}
        onChange={(e) => {
          setBulan(e.id);
          if (e.id > 0) {
            trx.getByMonth(e.id)
          } else {
            trx.reload();
          }
        }} />

    </Flex>
    {trx.items.map(o => o.id === selectedId ?
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

        <React.Suspense fallback={<div>Please wait...</div>}>
          <TrxForm
            isNew={o.id === 0}
            accs={accs.items}
            trx={o}
            callback={(e) => formResponse(e)}
          />
        </React.Suspense>

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
              {/* <Flex flex direction={{ base: 'row', M: 'column' }} columnGap='size-100' rowGap='size-50'> */}
              <View flex>{FormatDate(o.trxDate)}</View>
              {/* <View>Saldo: <b>{FormatNumber(o.saldo)}</b><br /></View> */}
              {/* </Flex> */}
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
    )}
    <View>

      {isBottom &&
        <ProgressCircle aria-label="Loading…" isIndeterminate />
      }
    </View>
    <View>
      <PrettyPrintJson data={{data: lastPage}} />
    </View>

  </View>
);

  // function getTotalTransaction(typeId: number): string {
  //   const value = trxs.items.filter(o => o.groupId === typeId).reduce((t, c) => t + c.saldo, 0)
  //   // const debt = trxs.items.filter(o=>o.trxTypeId===1).reduce((t,c)=>t+c.saldo,0)
  //   // const cred = trxs.items.filter(o=>o.trxTypeId===2).reduce((t,c)=>t+c.saldo,0)

  //   return FormatNumber(value)
  // }

  function formResponse(params: { method: string, data?: iTrx }) {
    const { method, data } = params

    switch (method) {
      case 'save':
        if (data) {
          if (selectedId === 0) {
            trx.update(0, data)
          } else {
            trx.update(selectedId, data)
            setSelectedId(-1)
            return;
          }
        }
        break;
      case 'remove':
        trx.remove(selectedId);
        break;
      case 'cancel':
        if (selectedId === 0) {
          trx.remove(0)
        }
        break;
    }

    setSelectedId(-1)
  }

  function addNewItem() {
    if (!trx.getItem(0)) {
      trx.insert(initTrx);
    }
    setSelectedId(0)
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
      <View width={{ base: '50%' }} UNSAFE_className={'text-right'}>CREDIT</View>
    </Flex>
  </Flex>;
}


export default Trx;