import React, { useState } from "react";
import axios from "../../lib/axios-base";
import { iAccCode, iAccType } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, ComboBox, Divider, Flex, Item, Link, ProgressCircle, SearchField, Text, useAsyncList } from "@adobe/react-spectrum";
import AccCodeForm, { initAccCode } from './form'
import { useParams } from "react-router-dom";


const AccCode = () => {
  const { id: paramId, name: typeName } = useParams()
  const [selectedId, setSelectedId] = React.useState<number>(-1);
  const [typeId, setTypeId] = useState<number>(0);
  const [txtSearch, setTxtSearch] = useState<string>('');

  let types = useAsyncList<iAccType>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/acc-type/", { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
          return []
        })

      return { items: res || [] }
    },
    getKey: (item: iAccType) => item.id
  })

  let accs = useAsyncList<iAccCode>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/acc-code/group-type/${paramId ? paramId : 0}/`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data
        })
        .catch(error => {
          console.log(error)
          return []
        })

      return { items: res || [] }
    },
    getKey: (item: iAccCode) => item.id
  })

  if (accs.isLoading || types.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <View><span className="div-h1">Akun{typeName ? ` - (Tipe ${typeName})` : ''}</span></View>


      <Flex direction='row' gap='size-200' marginY={'size-200'}>
        <Button variant="cta" onPress={() => addNewItem()}>Kode Akun Baru</Button>
        <SearchField
          type="search"
          aria-label="Nama kode akun"
          flex
          width={'auto'}
          value={txtSearch}
          placeholder={'e.g. kas | bank'}
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
          items={[{ id: 0, name: 'Pilih tipe akun', descriptions: '' }, ...types.items]}
          selectedKey={typeId}
          onSelectionChange={(e) => {
            setTypeId(+e);
            (+e === 0) ? loadAllCodes() : searchCodeByType(+e)
          }}
        >
          {o => <Item textValue={o.id === 0 ? 'Pilih kode akun' : `${o.id} - ${o.name}`}>
            <Text><span className="font-bold">{o.id === 0 ? 'Pilih kode akun' : `${o.id} - ${o.name}`}</span></Text>
            <Text slot='description'>{o.descriptions || ''}</Text>
          </Item>}
        </ComboBox>
      </Flex>

      <Divider size="S" marginY='size-100' />

      {showItems().map(o => {

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
              onInsert={(e) => insertAccCode(e)}
              onUpdate={(id, e) => updateAccCode(id, e)}
              onDelete={(e) => deleteAccCode(e)}
              onCancel={(e) => {
                setSelectedId(-1)
                if (e === 0) {
                  accs.remove(0)
                }}}
              />
          </View>
          :
          <View key={o.id}>
            <Flex direction={{ base: 'column', L: 'row' }} columnGap='size-200' rowGap='size-50'>
              <Flex flex direction={'row'} columnGap='size-100' rowGap='size-50'>
                <View width={'40px'}>
                  <Link isQuiet variant={'primary'} UNSAFE_className={'font-bold'}
                    onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                    <span>{o.id}</span>
                  </Link>
                </View>
                <View flex width={'auto'}>
                  <Link isQuiet variant={'primary'} 
                    UNSAFE_className={'font-bold'}
                    onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                    <span>{o.name}</span>
                  </Link>
                </View>
              </Flex>
              <View flex>
                {o.descriptions}
              </View>
            </Flex>
            <Divider size="S" marginY='size-100' />
          </View>
      })}
    </View >
  );

  function showItems(): iAccCode[] {
    if (accs.items && accs.items.length > 0) {
      return accs.items;
    }
    return [];
  }
  function addNewItem() {
    if (!accs.getItem(0)) {
      accs.insert(0, {...initAccCode, typeId: paramId? +paramId : 0});
    }
    setSelectedId(0)
  }

  async function searchCode(e: string) {

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();

    const headers = {
      'Content-Type': 'application/json'
    }

    //const txt = e.replace(/ /g, ' | ')

    await axios
      .get(`/acc-code/search-name/${e}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.append(...data);
      })
      .catch(error => {
        console.log(error)
      })

  }

  async function searchCodeByType(id: number) {

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();

    const headers = {
      'Content-Type': 'application/json'
    }

    await axios
      .get(`/acc-code/group-type/${id}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.append(...data);
      })
      .catch(error => {
        console.log(error)
      })

  }

  async function loadAllCodes() {

    accs.setSelectedKeys('all')
    accs.removeSelectedItems();

    const headers = {
      'Content-Type': 'application/json'
    }

    await axios
      .get(`/acc-code/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.append(...data);
      })
      .catch(error => {
        console.log(error)
      })

  }


  async function updateAccCode(oldId: number, p: iAccCode) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)

    await axios
      .put(`/acc-code/${oldId}/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.update(oldId, p)
        setSelectedId(-1)
      })
      .catch(error => {
        console.log(error)
      })
  }

  async function insertAccCode(p: iAccCode) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    const xData = JSON.stringify(p)

    await axios
      .post(`/acc-code/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.insert(0, p)
        accs.remove(0)
        setSelectedId(-1)
      })
      .catch(error => {
        console.log(error)
      })
  }


  async function deleteAccCode(p: number) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    await axios
      .delete(`/acc-code/${p}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        accs.remove(p)
        setSelectedId(-1)
      })
      .catch(error => {
        console.log(error)
      })
  }


}

export default AccCode;