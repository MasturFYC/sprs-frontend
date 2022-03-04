import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iTask } from '../component/interfaces'
import { Button, Flex, TextArea, TextField, View } from '@adobe/react-spectrum';
import axios from '../component/axios-base';

export const initTask: iTask = {
  orderId: 0,
  descriptions: '',
  periodFrom: dateParam(null),
  periodTo: dateParam(null),
  recipientName: '',
  recipientPosition: '',
  giverPosition: '',
  giverName: '',
}

type TaskFormOptions = {
  task: iTask,
  isNew: boolean,
  callback: (params: { method: string, task?: iTask }) => void
}

const TaskForm = (props: TaskFormOptions) => {
  const { task, callback, isNew } = props;
  const [data, setData] = React.useState<iTask>(initTask)
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const isRecipientNameValid = React.useMemo(
    () => data && data.recipientName.length > 0,
    [data]
  )
  const isGiverNameValid = React.useMemo(
    () => data && data.giverName.length > 0,
    [data]
  )
  const isRecipientPositionValid = React.useMemo(
    () => data && data.recipientPosition.length > 0,
    [data]
  )
  const isGiverPositionValid = React.useMemo(
    () => data && data.giverPosition.length > 0,
    [data]
  )
  const isDateValid = React.useMemo(
    () => {
      const d1 = new Date(data.periodFrom)
      const d2 = new Date(data.periodTo)
      return d1 < d2;
    },
    [data]
  )

  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(isNew ? {...initTask, orderId: task.orderId} : task)
    }

    return () => { isLoaded = false }

  }, [task, isNew])

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <h3>PERINTAH PEMBERIAN TUGAS</h3>
      <Flex direction={'column'} columnGap='size-200' rowGap='size-50'>
        <TextArea
          label='Keterangan'
          flex
          autoFocus
          width={{ base: 'auto' }}
          placeholder={'Untuk melakukan penagihan atau Penarikan atas kendaraan tersebut di atas'}
          value={data.descriptions}
          maxLength={128}
          onChange={(e) => changeData("descriptions", e)}
        />
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
          <TextField
            flex
            type={'date'}
            label='Periode Mulai'
            validationState={isDateValid ? 'valid' : 'invalid'}
            width={'auto'}
            value={dateOnly(data.periodFrom)}
            onChange={(e) => changeData("periodFrom", e)}
          />
          <TextField
            flex
            type={'date'}
            label='Periode akhir'
            validationState={isDateValid ? 'valid' : 'invalid'}
            width={'auto'}
            value={dateOnly(data.periodTo)}
            onChange={(e) => changeData("periodTo", e)}
          />
        </Flex>
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
          <TextField
            validationState={isGiverNameValid ? 'valid' : 'invalid'}
            label='Pemberi tugas'
            flex
            autoComplete='name'
            placeholder={'e.g. Abdul Rahman'}
            width={'auto'}
            value={data.giverName}
            maxLength={50}
            onChange={(e) => changeData("giverName", e)}
          />
          <TextField
            flex
            label='Jabatan pemberi tugas'
            validationState={isGiverPositionValid ? 'valid' : 'invalid'}
            width={'auto'}
            placeholder={'e.g. Branch Head'}
            value={data.giverPosition}
            maxLength={50}
            onChange={(e) => changeData("giverPosition", e)}
          />
        </Flex>
        <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
          <TextField
            flex
            label='Penerima tugas'
            width={'auto'}
            value={data.recipientName}
            placeholder={'e.g. Kepala Cabang PT SPRS'}
            validationState={isRecipientNameValid ? 'valid' : 'invalid'}
            maxLength={50}
            onChange={(e) => changeData("recipientName", e)}
          />
          <TextField
            flex
            label='Jabatan penerima tugas'
            width={'auto'}
            placeholder={'e.g. Field Collector'}
            value={data.recipientPosition}
            validationState={isRecipientPositionValid ? 'valid' : 'invalid'}
            maxLength={50}
            onChange={(e) => changeData("recipientPosition", e)}
          />
        </Flex>
        <Flex direction={'row'} columnGap='size-200' rowGap='size-50' marginTop={'size-200'}>
          <Flex flex direction={'row'} columnGap='size-100'>
            <Button type='submit'
              isDisabled={!isDirty || !(isGiverNameValid && isDateValid && isGiverPositionValid && isRecipientNameValid && isRecipientPositionValid)}
              variant='secondary'>Update</Button>
            <Button type='button' variant='primary'
              isDisabled={!isDirty}
              onPress={() => {
                setData(task);
                setIsDirty(false)
              }}>Cancel</Button>
          </Flex>
          {data.orderId > 0 &&
            <View>
              <Button
                isDisabled={isNew}
                type='button' alignSelf={'flex-end'} variant='negative'
                onPress={() => deleteData(data)}>Clear</Button>
            </View>
          }
        </Flex>
      </Flex>
    </form>
  );

  function changeData(fieldName: string, value: string | number | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isGiverNameValid && isGiverPositionValid && isDateValid && isRecipientNameValid && isRecipientPositionValid) {

      if (isNew) {
        await inserData(data);
      } else {
        await updateData(data);
      }
    }
  }

  async function updateData(p: iTask) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)

    await axios
      .put(`/tasks/${p.orderId}/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        //console.log(data)
        callback({ method: 'save', task: p })
        setIsDirty(false)
      })
      .catch(error => {
        console.log(error)
      })
  }

  async function inserData(p: iTask) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)

    await axios
      .post(`/tasks/`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        callback({ method: 'save', task: p })
        setIsDirty(false)
      })
      .catch(error => {
        console.log(error)
      })
  }


  async function deleteData(p: iTask) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    await axios
      .delete(`/tasks/${p.orderId}/`, { headers: headers })
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

export default TaskForm;