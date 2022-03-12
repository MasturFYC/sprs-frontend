import React, { FormEvent } from 'react';
import { iAccCode, iAccGroup, iAccType } from '../../lib/interfaces'
import {
  Button, Checkbox, ComboBox, Flex, Item, NumberField,
  Text,
  TextArea, TextField, View
} from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export const initAccCode: iAccCode = {
  id: 0,
  typeId: 0,
  name: '',
  descriptions: '',
  isActive: true
}

type AccCodeFormOptions = {
  accCode: iAccCode,
  types: iAccType[],
  isNew: boolean,
  callback: (params: { method: string, data?: iAccCode }) => void
}

const AccCodeForm = (props: AccCodeFormOptions) => {
  const { accCode, callback, isNew, types } = props;
  const [data, setData] = React.useState<iAccCode>(initAccCode)
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  const isIDValid = React.useMemo(
    () => data.id > 1110 && data.id < 10000,
    [data]
  )

  const isNameValid = React.useMemo(
    () => data.name.length > 5,
    [data]
  )

  const isTypeValid = React.useMemo(
    () => data.typeId > 0,
    [data]
  )


  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(accCode)
    }

    return () => { isLoaded = false }

  }, [accCode])

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex rowGap='size-50' direction={'column'}>
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
          <ComboBox
            flex
            autoFocus={isNew}
            menuTrigger='focus'
            validationState={isTypeValid ? "valid" : "invalid"}
            width={'auto'}
            label={"Tipe akun"}
            placeholder={"Pilih tipe"}
            defaultItems={types}
            selectedKey={data.typeId}
            onSelectionChange={(e) => changeData("typeId", +e)}
          >
            {(item) => <Item textValue={`${item.id} - ${item.name}`}>
              <Text><span className="font-bold">{item.id} - {item.name}</span></Text>
              <Text slot='description'>{item.descriptions}</Text>
            </Item>}
          </ComboBox>

          <NumberField
            label='Nomor kode akun'
            //isReadOnly={!isNew}
            formatOptions={{ useGrouping: false }}
            hideStepper={true}
            validationState={isIDValid ? 'valid' : 'invalid'}
            width={{ base: 'auto', M: '120px' }}
            value={data.id}
            onChange={(e) => changeData("id", e)}
          />
          <TextField
            label='Nama kode akun'
            flex
            autoFocus={!isNew}
            width={'auto'}
            value={data.name}
            placeholder={'e.g. Kas'}
            validationState={isNameValid ? 'valid' : 'invalid'}
            maxLength={50}
            onChange={(e) => changeData("name", e)}
          />
        </Flex>
        <TextArea
          label='Keterangan'
          flex
          width={'auto'}
          placeholder={'e.g. Group yang memuat akun-akun kas.'}
          value={data.descriptions}
          maxLength={256}
          onChange={(e) => changeData("descriptions", e)}
        />
      </Flex>
      <Flex direction={'row'} gap='size-100' marginY={'size-200'}>
        <Flex flex direction={'row'} columnGap={'size-125'}>
          <Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isIDValid && isTypeValid)}>Save</Button>
          <Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
            {isDirty ? 'Cancel' : 'Close'}</Button>
        </Flex>
        <View flex>
          <Checkbox isSelected={data.isActive} onChange={(e) => changeData("isActive", e)}>
            Aktif ?
          </Checkbox>
        </View>
        {data.id > 0 &&
          <View>
            <Button type='button' alignSelf={'flex-end'}
              isDisabled={data.id === 0}
              variant='negative'
              onPress={() => deleteAccCode(data)}>Remove</Button>
          </View>
        }
      </Flex>
    </form>
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isNameValid && isIDValid && isTypeValid) {

      if (isNew) {
        await insertAccCode(data);
      } else {
        await updateAccCode(data);
      }
    }
  }

  async function updateAccCode(p: iAccCode) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)

    await axios
      .put(`/acc-code/${accCode.id}/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        callback({ method: 'save', data: p })
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
        callback({ method: 'save', data: p })
      })
      .catch(error => {
        console.log(error)
      })
  }


  async function deleteAccCode(p: iAccCode) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    await axios
      .delete(`/acc-code/${p.id}/`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        callback({ method: 'remove', data: p })
      })
      .catch(error => {
        console.log(error)
      })
  }

  function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

}

export default AccCodeForm;
