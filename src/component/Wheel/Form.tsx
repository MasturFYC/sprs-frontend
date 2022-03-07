import React, { FormEvent } from 'react';
import { iWheel } from '../../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export const initWheel: iWheel = {
    id: 0,
    name: '',
    shortName: ''
}

type WheelFormOptions = {
    wheel: iWheel,
    callback: (params: { method: string, data?: iWheel }) => void
}

const WheelForm = (props: WheelFormOptions) => {
    const { wheel, callback } = props;
    const [data, setData] = React.useState<iWheel>(initWheel)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);
	const isNameValid = React.useMemo(
		() => data.name.length > 5,
		[data]
	)
	const isShortValid = React.useMemo(
		() => data.shortName.length >= 2,
		[data]
	)

    React.useEffect(() => {
        let isLoaded = true;

        if (isLoaded) {
            setData(wheel)
        }

        return () => { isLoaded = false }

    }, [wheel])

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <Flex gap='size-200' direction={{ base: 'column', M: 'row'}}>
                <TextField autoFocus label='Singkatan'
                    width={{ base: '100%' }}
                    value={data.shortName}
                    placeholder={'e.g. R2'}
                    validationState={isShortValid ? 'valid' : 'invalid'}
                    maxLength={2}
                    onChange={(e) => {
                        setIsDirty(true);
                        setData(prev => ({ ...prev, shortName: e }))
                    }}
                />
                <TextField label='Nama jenis roda'
                    width={{ base: '100%' }}
                    placeholder={'e.g. Roda Dua'}
                    value={data.name}
                    validationState={isNameValid ? 'valid' : 'invalid'}
                    maxLength={10}
                    onChange={(e) => {
                        setIsDirty(true);
                        setData(prev => ({ ...prev, name: e }));
                    }}
                />
            </Flex>
            <Flex direction={'row'} gap='size-100' marginY={'size-200'}>
                <Flex flex direction={'row'} columnGap={'size-100'}>
                    <Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isShortValid)}>Save</Button>
					<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
						{isDirty ? 'Cancel' : 'Close'}</Button>
                </Flex>
                {data.id > 0 &&
                    <View>
						<Button type='button' alignSelf={'flex-end'}
							isDisabled={data.id === 0}
						variant='negative' 
						onPress={() => deleteWheel(data)}>Remove</Button>
                    </View>
                }
            </Flex>
        </form>
    );

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (data.name.trim().length === 0) {
            return
        }

        if (data.id === 0) {
            await insertWheel(data);
        } else {
            await updateWheel(data);
        }
    }

    async function updateWheel(wheel: iWheel) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(wheel)

        await axios
            .put(`/wheels/${wheel.id}/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                console.log(data)
                callback({ method: 'save', data: wheel })
            })
            .catch(error => {
                console.log(error)
            })
    }

    async function insertWheel(wheel: iWheel) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(wheel)

        await axios
            .post(`/wheels/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                console.log(data)
                callback({ method: 'save', data: data })
            })
            .catch(error => {
                console.log(error)
            })
    }


    async function deleteWheel(wheel: iWheel) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        await axios
            .delete(`/wheels/${wheel.id}/`, { headers: headers })
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

export default WheelForm;