import React, { FormEvent, useState } from 'react';
import { iTrx, dateOnly, iAccountSpecific, dateParam } from '../../lib/interfaces'
import {
  Button, ComboBox, Flex,
  NumberField, Item, Text,
  TextArea, TextField, View
} from '@adobe/react-spectrum';
// import { createToken } from '../../lib/format';


type TrxAutoDebetFormProps = {
  trx: iTrx
  accountCashes: iAccountSpecific[]
  onCancle: () => void
  onSave: (id: number, data: iTrx) => void
  onSaveAndCreate?: (id: number, data: iTrx) => void
}

const TrxAutoDebetForm = ({
  trx,
  accountCashes,
  onCancle,
  onSave,
  onSaveAndCreate
}: TrxAutoDebetFormProps) => {
  const [cashId, setCashId] = useState<number>(0)
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [data, setData] = useState<iTrx>(trx)
  const inputRef = React.useRef<HTMLDivElement>(null);


  const isDescriptionsValid = React.useMemo(
    () => data.descriptions.length > 5,
    [data]
  )

  const isAccValid = React.useMemo(
    () => cashId > 0,
    [cashId]
  )

  const isSaldoValid = React.useMemo(
    () => data.saldo > 0,
    [data]
  )

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setData(trx)
    }
    return () => { isLoaded = true }
  }, [trx])


  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex rowGap='size-50' direction={'column'}>
        <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>          
          <TextField
            type={'date'}
            label='Tanggal transaksi'
            width={{ base: 'auto', M: 'size-2000' }}
            value={dateOnly(data.trxDate)}
            maxLength={10}
            onChange={(e) => handleChange("trxDate", e)}
          />
          <div ref={inputRef} style={{display: 'flex', width: '100%'}}>
          <TextField
            flex
            label='Keterangan'
            autoFocus
            width={{ base: 'auto' }}
            validationState={isDescriptionsValid ? 'valid' : 'invalid'}
            placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
            value={data.descriptions}
            maxLength={128}
            onChange={(e) => handleChange("descriptions", e)}
          />
          </div>
        </Flex>
        <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>

          <NumberField
            hideStepper={true}
            width={{ base: 'auto', M: 'size-2000' }}
            validationState={isSaldoValid ? 'valid' : 'invalid'}
            label={"Jumlah transaksi"}
            onChange={(e) => handleChange("saldo", e)}
            value={data.saldo} />
          <ComboBox
            flex
            menuTrigger='focus'
            width={'auto'}
            validationState={isAccValid ? 'valid' : 'invalid'}
            label={"Akun kas yg terlibat transaksi"}
            placeholder={"e.g. Kas / bank"}
            defaultItems={accountCashes}
            selectedKey={cashId}
            onSelectionChange={(e) => {
              setIsDirty(true)
              setCashId(+e)
            }}
          >
            {(item) => <Item textValue={`${item.id} - ${item.name}`}>
              <Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
              <Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
            </Item>}
          </ComboBox>
        </Flex>

        <TextArea
          label='Memo'
          flex
          width={'auto'}
          placeholder={'e.g. Memo'}
          value={data.memo || ''}
          maxLength={128}
          onChange={(e) => handleChange("memo", e)}
        />
      </Flex>
      <Flex direction={'row'} gap='size-100' marginBottom={'size-100'} marginTop={'size-200'}>
        <Flex flex direction={'row'} columnGap={'size-125'}>
          <Button type='submit' variant='cta'
            isDisabled={!isDirty || !(isDescriptionsValid && isAccValid && isSaldoValid)}>Save</Button>
          <Button variant='negative'
            isDisabled={!isDirty || !(isDescriptionsValid && isAccValid && isSaldoValid)}
            onPress={() => {
              if (onSaveAndCreate) {
                onSaveAndCreate(cashId, data)
                setData({
                  id: 0,
                  refId: 0,
                  division: 'trx-auto',
                  trxDate: dateParam(null),
                  descriptions: '',
                  memo: '',
                  saldo: 0,
                  details: []
                })
                setCashId(0)
                if (inputRef.current) {
                  const inp = inputRef.current.getElementsByTagName("input")
                  if(inp[0]) {
                    inp[0].focus()
                  }
                }
              }
            }}
          >Simpan dan buat baru</Button>
        </Flex>
        <View>
          <Button type='button' variant='primary'
            onPress={() => onCancle()}>
            {isDirty ? 'Cancel' : 'Close'}</Button>
        </View>
      </Flex>
    </form >
  );


  function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isDescriptionsValid && isAccValid && isSaldoValid) {
      onSave(cashId, data)
    }
  }
}

export default TrxAutoDebetForm;