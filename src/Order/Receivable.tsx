import React, { FormEvent, useState } from 'react';
import { iReceivable, dateOnly, dateParam } from '../lib/interfaces'
import { Button, Flex, NumberField, TextField, View } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';

const initReceivable: iReceivable = {
  orderId: 0,
  covenantAt: dateParam(null),
  dueAt: dateParam(null),
  mortgageByMonth: 0,
  mortgageReceivable: 0,
  runningFine: 0,
  restFine: 0,
  billService: 0,
  payDeposit: 0,
  restReceivable: 0,
  restBase: 0,
  dayPeriod: 0,
  mortgageTo: 0,
  dayCount: 0
}

type ReceivableFormOptions = {
  receive: iReceivable,
  isNew: boolean,
  callback: (params: { method: string, receivable?: iReceivable }) => void
}

const ReceivableForm = (props: ReceivableFormOptions) => {
  const { receive, callback, isNew } = props;
  const [data, setData] = React.useState<iReceivable>(initReceivable)
  const [isDirty, setIsDirty] = useState<boolean>(false);

  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(isNew ?
        { ...initReceivable, orderId: receive.orderId }
        :
        receive
      )
    }

    return () => { isLoaded = false }

  }, [receive, isNew])

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className='div-h2'>DATA TUNGGAKAN</div>
      <Flex gap='size-50' direction={'column'}>
        <Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
          <TextField
            flex
            type={'date'}
            label='Tanggal perjanjian'
            width={'auto'}
            value={dateOnly(data.covenantAt)}
            onChange={(e) => changeData("covenantAt", e)}
          />
          <TextField
            flex
            type={'date'}
            label='Tanggal jatuh tempo'
            width={'auto'}
            value={dateOnly(data.dueAt)}
            onChange={(e) => changeData("dueAt", e)}
          />
        </Flex>
        <Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
          <NumberField
            flex
            label='Angsuran per bulan'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.mortgageByMonth}
            onChange={(e) => changeData("mortgageByMonth", e)}
          />
          <NumberField
            flex
            label='Angsuran tunggakan'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.mortgageReceivable}
            onChange={(e) => changeData("mortgageReceivable", e)}
          />
          <NumberField
            flex
            label='Denda berjalan'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.runningFine}
            onChange={(e) => changeData("runningFine", e)}
          />
          <NumberField
            flex
            label='Sisa denda'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.restFine}
            onChange={(e) => changeData("restFine", e)}
          />
        </Flex>
        <Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
          <NumberField
            flex
            label='Jasa penagihan'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.billService}
            onChange={(e) => changeData("billService", e)}
          />
          <NumberField
            flex
            label='Bayar titipan'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.payDeposit}
            onChange={(e) => changeData("payDeposit", e)}
          />
          <NumberField
            flex
            label='Sisa piutang'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.restReceivable}
            onChange={(e) => changeData("restReceivable", e)}
          />
          <NumberField
            flex
            label='Sisa pokok'
            // formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.restBase}
            onChange={(e) => changeData("restBase", e)}
          />
        </Flex>
        <Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
          <NumberField
            flex
            label='Jangka waktu'
            formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.dayPeriod}
            onChange={(e) => changeData("dayPeriod", e)}
          />
          <NumberField
            flex
            label='Angsuran yang ke'
            formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.mortgageTo}
            onChange={(e) => changeData("mortgageTo", e)}
          />
          <NumberField
            flex
            label='Jumlah hari angsuran'
            formatOptions={{ useGrouping: false }}
            hideStepper={true}
            width={'auto'}
            value={data.dayCount}
            onChange={(e) => changeData("dayCount", e)}
          />
        </Flex>
        <Flex direction={'row'} gap='size-100' marginTop={'size-200'}>
          <Flex flex direction={'row'} columnGap={'size-100'}>
            <Button type='submit' variant='secondary' isDisabled={!isDirty}>Update</Button>
            <Button type='button' variant='primary'
              isDisabled={!isDirty}
              onPress={() => {
                setData(receive);
                setIsDirty(false)                
              }}>Cancel</Button>
        </Flex>
        {data.orderId > 0 &&
          <View>
            <Button type='button'
              isDisabled={isNew}
              alignSelf={'flex-end'} variant='negative'
              onPress={() => deleteData(data)}>Clear</Button>
          </View>
        }
      </Flex>
    </Flex>
    </form >
  );

function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
  setData(o => ({ ...o, [fieldName]: value }))
  setIsDirty(true)
}
async function handleSubmit(e: FormEvent) {
  e.preventDefault()

  if (isNew) {
    await inserData(data);
  } else {
    await updateData(data);
  }
}

async function updateData(p: iReceivable) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  const xData = JSON.stringify(p)

  await axios
    .put(`/receivables/${p.orderId}/`, xData, { headers: headers })
    .then(response => response.data)
    .then(data => {
      callback({ method: 'save', receivable: p })
      setIsDirty(false)
    })
    .catch(error => {
      console.log(error)
    })
}

async function inserData(p: iReceivable) {

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  const xData = JSON.stringify(p)

  await axios
    .post(`/receivables/`, xData, { headers: headers })
    .then(response => response.data)
    .then(data => {
      callback({ method: 'save', receivable: p })
      setIsDirty(false)
    })
    .catch(error => {
      console.log(error)
    })
}


async function deleteData(p: iReceivable) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  await axios
    .delete(`/receivables/${p.orderId}/`, { headers: headers })
    .then(response => response.data)
    .then(data => {
      callback({ method: 'remove' })
      setIsDirty(false)
    })
    .catch(error => {
      console.log(error)
    })
}

}

export default ReceivableForm;