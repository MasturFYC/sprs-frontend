import React, { FormEvent } from 'react';
import { dateOnly, iAction, dateParam } from '../interfaces';
import { Button, Flex, TextArea, TextField, View } from '@adobe/react-spectrum';
import axios from '../axios-base';

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
  const [data, setData] = React.useState<iAction>(initAction);

  React.useEffect(() => {
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
      <Flex gap='size-200' direction={{ base: 'column', M: 'row' }}>
        <TextField
          type={'date'}
          label='Tanggal'
          autoFocus
          width={{ base: '100%' }}
          value={dateOnly(data.actionAt)}
          maxLength={10}
          onChange={(e) => setData((prev) => ({ ...prev, actionAt: e }))}
        />
        <TextField
          label='Kode'
          width={{ base: '100%' }}
          value={data.code}
          maxLength={50}
          onChange={(e) => setData((prev) => ({ ...prev, code: e }))}
        />
      </Flex>
      <Flex gap='size-200' direction={{ base: 'column', M: 'row' }}>
        <TextField
          flex
          label='Pic'
          width={'auto'}
          value={data.pic}
          maxLength={50}
          onChange={(e) => setData((prev) => ({ ...prev, pic: e }))}
        />
      <TextArea
        flex
        label='Keterangan'
        width={'auto'}
        value={data.descriptions || ''}
        maxLength={128}
        onChange={(e) => setData((prev) => ({ ...prev, descriptions: e }))}
      />
      </Flex>
      <Flex direction={'row'} gap='size-100' marginY={'size-200'}>
        <Flex flex direction={'row'} columnGap={'size-100'}>
          <Button type='submit' variant='cta'>
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

  async function updateAction(action: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const xData = JSON.stringify(action);
    console.log(action)

    await axios
      .put(`/actions/${action.id}/`, xData, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        callback({ method: 'save', data: action });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function insertAction(action: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const xData = JSON.stringify(action);

    await axios
      .post(`/actions/`, xData, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        callback({ method: 'save', data: data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function deleteAction(action: iAction) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    await axios
      .delete(`/actions/${action.id}/`, { headers: headers })
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        callback({ method: 'remove', data: data });
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

export default ActionForm;
