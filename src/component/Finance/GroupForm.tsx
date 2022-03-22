import React, { FormEvent } from 'react';
import { iFinanceGroup } from '../../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export type FinanceGroupFormOptions = {
  group: iFinanceGroup,
  onInsert: (e: iFinanceGroup) => void,
  onUpdate: (id: number, e: iFinanceGroup) => void,
  onDelete: (id: number) => void,
  onCancel?: (id: number) => void,
}

const FinanceGroupForm = (props: FinanceGroupFormOptions) => {
  const { group, onInsert, onUpdate, onDelete, onCancel } = props;
  const [data, setData] = React.useState<iFinanceGroup>({ id: 0, name: '' } as iFinanceGroup)
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  const isNameValid = React.useMemo(
    () => data.name.length >= 3,
    [data]
  )

  React.useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(group)
    }

    return () => { isLoaded = false }

  }, [group])

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex gap='size-200' direction={'column'} marginBottom='size-200'>
        <TextField autoFocus
          width={'auto'}
          value={data.name}
          labelPosition={"side"}
          label={<View width={'size-1600'}>Nama group finance:</View>}
          validationState={isNameValid ? 'valid' : 'invalid'}
          maxLength={50}
          placeholder={'e.g. BAF'}
          onChange={(e) => handleChange("name", e)}
        />

        <Flex direction={'row'} gap='size-100'>
          <Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid)}>Save</Button>
          <Button type='button' variant='primary' onPress={() => onCancel && onCancel(data.id)}>
            {isDirty ? 'Cancel' : 'Close'}</Button>
          {data.id > 0 &&
            <Button type='button'
              isDisabled={data.id === 0}
              variant='negative'
              onPress={() => deleteGroup(data).then(res => onDelete(data.id))}>Remove</Button>
          }
        </Flex>
      </Flex>
    </form>
  );


  function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (data.name.trim().length === 0) {
      return
    }

    if (data.id === 0) {
      await insertGroup(data).then(res => onInsert({ ...data, id: res.id }));
    } else {
      await updateGroup(data).then(res => onUpdate(data.id, data));
    }
  }

  async function updateGroup(g: iFinanceGroup) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(g)

    const res = await axios
      .put(`/finance-group/${g.id}`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => data)
      .catch(error => {
        console.log(error)
      })

    return res;
  }

  async function insertGroup(g: iFinanceGroup) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(g)

    const res = await axios
      .post(`/finance-group`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => data)
      .catch(error => {
        console.log(error)
      })

    return res;
  }


  async function deleteGroup(g: iFinanceGroup) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const res = await axios
      .delete(`/finance-group/${g.id}`, { headers: headers })
      .then(response => response.data)
      .then(data => data)
      .catch(error => {
        console.log(error)
      })

    return res;
  }

}

export default FinanceGroupForm;