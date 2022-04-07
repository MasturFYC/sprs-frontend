import React, { FormEvent } from 'react';
import { iMerk } from '../../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export type MerkFormOptions = {
    merk: iMerk,
    callback: (params: { method: string, data?: iMerk }) => void
}

const MerkForm = (props: MerkFormOptions) => {
    const { merk, callback } = props;
    const [data, setData] = React.useState<iMerk>({ id: 0, name: '' } as iMerk)
    const [isDirty, setIsDirty] = React.useState<boolean>(false);
    const isNameValid = React.useMemo(
        () => data.name.length >= 3,
        [data]
    )
    React.useEffect(() => {
        let isLoaded = true;

        if (isLoaded) {
            setData(merk)
        }

        return () => { isLoaded = false }

    }, [merk])

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <Flex gap='size-100' direction={{ base: 'column', L: 'row' }} marginBottom='size-200'>
                <View>
                    <TextField autoFocus aria-label='Merk-Kendaraan'
                        width={{ base: '100%' }}
                        value={data.name}
                        validationState={isNameValid ? 'valid' : 'invalid'}
                        maxLength={50}
                        placeholder={'Yamaha'}
                        onChange={(e) => {
                            setIsDirty(true)
                            setData(prev => ({ ...prev, name: e }))
                        }}
                    />
                </View>
                <Flex direction={'row'} gap='size-100'>
                    <Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid)}>Save</Button>
                    <Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
                        {isDirty ? 'Cancel' : 'Close'}</Button>
                    {data.id > 0 &&
                        <Button type='button'
                            isDisabled={data.id === 0}
                            variant='negative'
                            onPress={() => deleteMerk(data)}>Remove</Button>
                    }
                </Flex>
            </Flex>
        </form>
    );

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (data.name.trim().length === 0) {
            return
        }

        if (data.id === 0) {
            await insertMerk(data);
        } else {
            await updateMerk(data);
        }
    }

    async function updateMerk(merk: iMerk) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(merk)

        await axios
            .put(`/merk/${merk.id}`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                callback({ method: 'save', data: merk })
            })
            .catch(error => {
                console.log(error)
            })
    }

    async function insertMerk(merk: iMerk) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(merk)

        await axios
            .post(`/merk`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                callback({ method: 'save', data: data })
            })
            .catch(error => {
                console.log(error)
            })
    }


    async function deleteMerk(merk: iMerk) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        await axios
            .delete(`/merk/${merk.id}`, { headers: headers })
            .then(response => response.data)
            .then(data => {
                callback({ method: 'remove', data: data })
            })
            .catch(error => {
                console.log(error)
            })
    }

}

export default MerkForm;