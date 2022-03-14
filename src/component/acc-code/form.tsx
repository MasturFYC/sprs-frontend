import React, { FormEvent } from 'react';
import { iAccCode, iAccType } from '../../lib/interfaces'
import {
  Button, Checkbox, ComboBox, Flex, Item, NumberField,
  Radio,
  RadioGroup,
  Text,
  TextArea, TextField, View
} from '@adobe/react-spectrum';

export const initAccCode: iAccCode = {
  id: 0,
  typeId: 0,
  name: '',
  descriptions: '',
  isActive: true,
  isAutoDebet: false,
  option: 2 // {0: None, 1: Kas, 2: Receivable, 3: Paayable}
}

type AccCodeFormOptions = {
  accCode: iAccCode,
  types: iAccType[],
  isNew: boolean,
  onInsert: (data: iAccCode) => void,
  onCancel: (id: number) => void,
  onUpdate: (id: number, data: iAccCode) => void,
  onDelete: (id: number) => void,
}

const AccCodeForm = (props: AccCodeFormOptions) => {
  const { accCode, onInsert, onCancel, onDelete, onUpdate, isNew, types } = props;
  const [data, setData] = React.useState<iAccCode>(initAccCode)
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  const isIDValid = React.useMemo(
    () => data.id > 1110 && data.id < 10000,
    [data]
  )

  const isNameValid = React.useMemo(
    () => data.name.length > 2,
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
            onSelectionChange={(e) => handleChange("typeId", +e)}
          >
            {(item) => <Item textValue={`${item.id} - ${item.name}`}>
              <Text><span className="font-bold">{item.id} - {item.name}</span></Text>
              <Text slot='description'>{item.descriptions}</Text>
            </Item>}
          </ComboBox>

          <NumberField
            label='Nomor akun'
            isReadOnly={!isNew}
            formatOptions={{ useGrouping: false }}
            hideStepper={true}
            validationState={isIDValid ? 'valid' : 'invalid'}
            width={{ base: 'auto', M: '120px' }}
            value={data.id}
            onChange={(e) => handleChange("id", e)}
          />
          <TextField
            label='Nama akun'
            flex
            autoFocus={!isNew}
            width={'auto'}
            value={data.name}
            placeholder={'e.g. Kas'}
            validationState={isNameValid ? 'valid' : 'invalid'}
            maxLength={50}
            onChange={(e) => handleChange("name", e)}
          />
        </Flex>
        <TextArea
          label='Keterangan'
          flex
          width={'auto'}
          placeholder={'e.g. Group yang memuat akun-akun kas.'}
          value={data.descriptions}
          maxLength={256}
          onChange={(e) => handleChange("descriptions", e)}
        />
      </Flex>
      <View>
        <RadioGroup label="Seting akun"
        marginTop={'size-100'}
        orientation='horizontal'
        onChange={(e) => handleChange("option", +e)} value={''+data.option}>
          <Radio value="0">None</Radio>
          <Radio value="1">Kas</Radio>
          <Radio value="2">Receivable</Radio>
          <Radio value="3">Payable</Radio>
        </RadioGroup>
      </View>
      <Flex direction={'row'} gap='size-100' marginY={'size-200'}>
        <Flex flex direction={'row'} columnGap={'size-125'}>
          <Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isIDValid && isTypeValid)}>Save</Button>
          <Button type='button' variant='primary' onPress={() => onCancel(accCode.id)}>
            {isDirty ? 'Cancel' : 'Close'}</Button>
        </Flex>
        <View flex>
          <Checkbox isSelected={data.isActive} onChange={(e) => handleChange("isActive", e)}>Aktif ?</Checkbox>
          <Checkbox isSelected={data.isAutoDebet} onChange={(e) => handleChange("isAutoDebet", e)}>Auto Debet ?</Checkbox>
        </View>
        {data.id > 0 &&
          <View>
            <Button type='button' alignSelf={'flex-end'}
              isDisabled={data.id === 0}
              variant='negative'
              onPress={() => onDelete(accCode.id)}>Remove</Button>
          </View>
        }
      </Flex>
    </form>
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isNameValid && isIDValid && isTypeValid) {
      if (accCode.id === 0) {
        onInsert(data)
      } else {
        onUpdate(accCode.id, data)
      }
    }
  }
  function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

}

export default AccCodeForm;
