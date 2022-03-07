import React, { useState } from "react";
import axios from "../../lib/axios-base";
import { iAccCodeType, iTrx, iTrxType } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, ComboBox, Flex, Item, Link, ProgressCircle, SearchField, Text, useAsyncList } from "@adobe/react-spectrum";
import TrxForm, { initTrx } from './form'
import { FormatDate } from "../../lib/format";

const Trx = () => {
  const [selectedId, setSelectedId] = React.useState<number>(-1);
  const [typeId, setTypeId] = useState<number>(0);
  const [txtSearch, setTxtSearch] = useState<string>('');

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

  let types = useAsyncList<iTrxType>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/trx-type/", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iTrxType) => item.id
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
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iTrx) => item.id
  })

  if (accs.isLoading || types.isLoading || trxs.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
  }
  return (
    <View>
      <h1>Transaksi</h1>

      <Flex direction='row' gap='size-200'
        marginY={'size-200'}>
        <Button variant="cta" onPress={() => addNewItem()}>Transaksi Baru</Button>
        <SearchField
          type="search"
          aria-label="trx-search-transaction"
          flex
          width={'auto'}
          value={txtSearch}
          placeholder={'e.g. rokok kopi'}
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
        <ComboBox
          flex
          width={'auto'}
          label={"Jenis transaksi"}
          labelPosition={'side'}
          menuTrigger='focus'
          placeholder={"e.g. Pengeluaran"}
          defaultItems={[{ id: 0, name: 'Pilih jenis transaksi', descriptions: '' }, ...types.items]}
          selectedKey={typeId}
          onSelectionChange={(e) => {
            setTypeId(+e);
            if (+e === 0) {
              loadAllCodes();
            } else {
              searchTransactByType(+e)
            }
          }}
        >
          {(item) => <Item textValue={`${item.id} - ${item.name}`}>
            <Text><span style={{ fontWeight: 700 }}>{item.id} - {item.name}</span></Text>
            <Text slot='description'>{item.descriptions}</Text>
          </Item>}
        </ComboBox>
      </Flex>


      {trxs.items && trxs.items.map(o => {

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
              types={types.items}
              callback={(e) => formResponse(e)}
            />
          </View>
          :
          <View key={o.id}>
            <View backgroundColor={'gray-100'} padding={'size-100'}>
              <Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
                onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                <span>#{o.id} - {o.descriptions}</span>
              </Link>
            </View>
            <View padding={'size-100'}>
              <Flex flex direction={{ base: 'column', L: 'row' }} columnGap='size-200' rowGap='size-50'>
                <View flex>
                  <View>{FormatDate(o.trxDate)}</View>
                  <View>{o.trxTypeId > 0 ? types.getItem(o.trxTypeId).name : ''}</View>
                </View>
                <View flex>
                  Saldo: <b>{o.details ? o.details.reduce((a, b) => a + b.debt, 0) : 0}</b><br />
                  Memo: {o.memo || ''}
                </View>
              </Flex>
            </View>
          </View>
      })}
    </View>
  );

  function formResponse(params: { method: string, data?: iTrx }) {
    const { method, data } = params

    switch (method) {
      case 'save':
        if (data) {
          if (selectedId === 0) {
            trxs.update(0, data)
          } else {
            trxs.update(selectedId, data)
          }
        }
        break;
      case 'remove':
        trxs.remove(selectedId);
        break;
      case 'cancel':
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
  }

  async function searchTransact(e: string) {

    const headers = {
      'Content-Type': 'application/json'
    }

    const txt = e.replace(/ /g, ' | ')

    let res = await axios
      .get(`/acc-code/search-name/${txt}/`, { headers: headers })
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
      .get(`/acc-code/group-type/${id}/`, { headers: headers })
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

export default Trx;