import React, { useState } from "react";
import axios from "../../lib/axios-base";
import { iAccCode, iAccType } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, ComboBox, Divider, Flex, Item, Link, SearchField, Text, useAsyncList } from "@adobe/react-spectrum";
import AccCodeForm, { initAccCode } from './form'

const AccCode = () => {
  const [selectedId, setSelectedId] = React.useState<number>(-1);
  const [typeId, setTypeId] = useState<number>(0);
  const [txtSearch, setTxtSearch] = useState<string>('');

  let accs = useAsyncList<iAccCode>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/acc-code/", { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iAccCode) => item.id
  })

  let types = useAsyncList<iAccType>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/acc-type/", { headers: headers })
        .then(response => response.data)
        .then(data => data ? data : [])
        .catch(error => {
          console.log('-------', error)
        })

      return { items: res }
    },
    getKey: (item: iAccType) => item.id
  })

  return (
    <View>
      <h1>Kode Akun</h1>

      <Flex direction='row' gap='size-200' marginY={'size-200'}>
        <Button variant="cta" onPress={() => addNewItem()}>Kode Akun Baru</Button>
        <SearchField
          type="search"
          aria-label="Nama kode akun"
          flex
          width={'auto'}
          value={txtSearch}
          placeholder={'e.g. kas'}
          //validationState={txtSearch.length > 2 ? 'valid' : 'invalid'}
          maxLength={50}
          onClear={() => {
            loadAllCodes();
          }}
          onSubmit={(e) => {
            searchCode(e)
          }}
          onChange={(e) => setTxtSearch(e)}
        />
        <ComboBox
          flex
          width={'auto'}
          label={"Tipe akun"}
          labelPosition={'side'}
          menuTrigger='focus'
          placeholder={"e.g. Adira"}
          defaultItems={[{ id: 0, name: 'Pilih tipe akun', descriptions: '' }, ...types.items]}
          selectedKey={typeId}
          onSelectionChange={(e) => {
            setTypeId(+e);
            if (+e === 0) {
              loadAllCodes();
            } else {
              searchCodeByType(+e)
            }
          }}
        >
          {(item) => <Item textValue={`${item.id} - ${item.name}`}>
            <Text><span style={{ fontWeight: 700 }}>{item.id} - {item.name}</span></Text>
            <Text slot='description'>{item.descriptions}</Text>
          </Item>}
        </ComboBox>
      </Flex>

      <Divider size="S" marginY='size-100' />

      {accs.items && accs.items.map(o => {

        return o.id === selectedId ?
          <View key={o.id}
            backgroundColor={'gray-100'}
            borderRadius={'medium'}
            borderColor={'indigo-400'}
            borderWidth={'thin'}
            paddingX={'size-200'}
            paddingY={'size-50'}
            marginBottom={'size-200'}
          >
            <AccCodeForm
              isNew={o.id === 0}
              accCode={o}
              types={types.items}
              callback={(e) => formResponse(e)}
            />
          </View>
          :
          <View key={o.id}>
            <Flex direction={{ base: 'column', L: 'row' }} columnGap='size-200' rowGap='size-50'>
              <View width={{ base: 'auto', M: '30%' }}>
                <Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
                  onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                  <span>{o.id} - {o.name}</span>
                </Link>
              </View>
              <View flex>
                {o.descriptions}
              </View>
            </Flex>
            <Divider size="S" marginY='size-100' />
          </View>
      })}
    </View>
  );

  function formResponse(params: { method: string, data?: iAccCode }) {
    const { method, data } = params

    switch (method) {
      case 'save':
        if (data) {
          if (selectedId === 0) {
            accs.update(0, data)
          } else {
            accs.update(selectedId, data)
          }
        }
        break;
      case 'remove':
        accs.remove(selectedId);
        break;
      case 'cancel':
        if (selectedId === 0) {
          accs.remove(0)
        }
        break;
    }

    setSelectedId(-1)
  }

  function addNewItem() {
    if (!accs.getItem(0)) {
      accs.insert(0, initAccCode);
    }
    setSelectedId(0)
  }

  async function searchCode(e: string) {

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

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();
    accs.append(...res);

  }

  async function searchCodeByType(id: number) {

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

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();
    accs.append(...res);
  }

  async function loadAllCodes() {

    const headers = {
      'Content-Type': 'application/json'
    }

    let res = await axios
      .get(`/acc-code/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        return data ? data : []
      })
      .catch(error => {
        console.log('-------', error)
        return []
      })

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();
    accs.append(...res);
  }

}

export default AccCode;