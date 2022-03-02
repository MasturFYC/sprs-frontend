import React, { FormEvent } from 'react';
import { iMerk } from '../interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from 'axios';

export type MerkFormOptions = {
    merk: iMerk,
    callback: (params: { method: string, data?: iMerk }) => void
}

const MerkForm = (props: MerkFormOptions) => {
    const { merk, callback } = props;
    const [data, setData] = React.useState<iMerk>({ id: 0, name: '' } as iMerk)

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
                        onChange={(e) => setData(prev => ({ ...prev, name: e }))}
                    />
                </View>
                <Flex direction={'row'} gap='size-100'>
                    <Button type='submit' variant='cta'>Save</Button>
                    <Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>Cancel</Button>
                    {data.id > 0 &&
                        <Button type='button' variant='negative' onPress={() => deleteMerk(data)}>Remove</Button>
                    }
                </Flex>
            </Flex>
        </form>
    );

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if(data.name.trim().length === 0 ) {
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
            .put(`http://pixel.id:8181/api/merks/${merk.id}/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                console.log(data)
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
            .post(`http://pixel.id:8181/api/merks/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                console.log(data)
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
            .delete(`http://pixel.id:8181/api/merks/${merk.id}/`, { headers: headers })
            .then(response => response.data)
            .then(data => {
                console.log(data)
                callback({ method: 'remove', data: data })
            })
            .catch(error => {
                console.log(error)
            })
    }

}

export default MerkForm;