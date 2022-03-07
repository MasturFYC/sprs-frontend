import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { dateOnly, iAction, dateParam } from '../../lib/interfaces';
import { Button, Flex, TextArea, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export const initAction: iAction = {
  id: 0,
  actionAt: dateParam(null),
  code: '',
  pic: '',
  descriptions: '',
  orderId: 2
};

type ActionFormOptions = {
  action: iAction,
  callback: (params: { method: string, data?: iAction }) => void,
};

const ActionForm = (props: ActionFormOptions) => {
  const { action, callback } = props;
  const [data, setData] = useState<iAction>(initAction);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const isDescriptionsValid = useMemo(
    () => {
      if (data.descriptions) {
        return data.descriptions.length > 0
      }
      return false
    },
    [data]
  )

  const isPicValid = React.useMemo(
    () => data.pic.length >= 3,
    [data]
  )
  const isCodeValid = React.useMemo(
    () => data.code.length >= 3,
    [data]
  )


  useEffect(() => {
    let isLoaded = true;

    if (isLoaded) {
      setData(action);
    }

    return () => {
      isLoaded = false;
    };
  }, [action]);

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex rowGap={'size-50'} direction={'column'}>
      <Flex columnGap='size-200' rowGap={'size-50'} direction={{ base: 'column', M: 'row' }}>
        <TextField
          type={'date'}
          label='Tanggal'
          autoFocus
          width={'auto'}
          value={dateOnly(data.actionAt)}
          onChange={(e) => changeData("actionAt", e)}
        />
        <TextField
          flex
          autoFocus
          label='Kode'
          width={'auto'}
          validationState={isCodeValid ? 'valid' : 'invalid'}
          placeholder={'e.g. CODE-2'}
          value={data.code}
          maxLength={50}
          onChange={(e) => changeData("code", e)}
        />
        <TextField
          validationState={isPicValid ? 'valid' : 'invalid'}
          flex
          placeholder={'e.g. CO-1'}
          label='Pic'
          width={'auto'}
          value={data.pic}
          maxLength={50}
          onChange={(e) => changeData("pic", e)}
        />
        </Flex>
      <TextArea
        validationState={isDescriptionsValid ? 'valid' : 'invalid'}
        flex
        label='Keterangan'
        placeholder={'e.g. Kendaraan sudah tidak ada di pelanggan pada tanggal: ...'}
        width={'auto'}
        value={data.descriptions || ''}
        maxLength={256}
        onChange={(e) => changeData("descriptions", e)}
      />
      </Flex>
      <Flex direction={'row'} gap='size-100' marginY={'size-200'}>
        <Flex flex direction={'row'} columnGap={'size-100'}>
          <Button type='submit' variant='cta'
            isDisabled={!isDirty || !(isDescriptionsValid && isPicValid && isCodeValid)}
          >
            Save
          </Button>
          <Button
            type='button'
            variant='primary'
            onPress={() => callback({ method: 'cancel' })}
          >
            Cancel
          </Button>
        </Flex>
        {data.id > 0 && (
          <View>
            <Button
              type='button'
              alignSelf={'flex-end'}
              isDisabled={data.id === 0}
              variant='negative'
              onPress={() => deleteAction(data)}
            >
              Remove
            </Button>
          </View>
        )}
      </Flex>
    </form>
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (data.actionAt.trim().length === 0) {
      return;
    }

    if (data.id === 0) {
      await insertAction(data);
    } else {
      await updateAction(data);
    }
  }

  async function updateAction(p: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const xData = JSON.stringify(p);

    await axios
      .put(`/actions/${p.id}/`, xData, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        callback({ method: 'save', data: p });
        setIsDirty(false)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function insertAction(p: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const xData = JSON.stringify(p);

    await axios
      .post(`/actions/`, xData, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        callback({ method: 'save', data: data });
        setIsDirty(false)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function deleteAction(p: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    await axios
      .delete(`/actions/${p.id}/`, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        callback({ method: 'remove', data: p });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
    setData(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }

};

export default ActionForm;
