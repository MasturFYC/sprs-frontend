import React, { FormEvent } from 'react';
import { iAccType } from '../../lib/interfaces'
import { Button, Flex, NumberField, TextArea, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

export const initAccType: iAccType = {
	id: 0,
	name: '',
	descriptions: ''
}

type AccTypeFormOptions = {
	accType: iAccType,
	isNew: boolean,
	callback: (params: { method: string, data?: iAccType }) => void
}

const AccTypeForm = (props: AccTypeFormOptions) => {
	const { accType, callback, isNew } = props;
	const [data, setData] = React.useState<iAccType>(initAccType)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isIDValid = React.useMemo(
		() => data.id > 10 && data.id < 100,
		[data]
	)

	const isNameValid = React.useMemo(
		() => data.name.length > 2,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(accType)
		}

		return () => { isLoaded = false }

	}, [accType])

	return (
			<form onSubmit={(e) => handleSubmit(e)}>
				<Flex rowGap='size-50' direction={'column'}>
					<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
						<NumberField
							label='Nomor tipe akun'
							autoFocus={isNew}
							isReadOnly={!isNew}
							formatOptions={{ useGrouping: false }}
							hideStepper={true}
							validationState={isIDValid ? 'valid' : 'invalid'}
							width={{ base: 'auto', M: '120px' }}
							value={data.id}
							onChange={(e) => changeData("id", e)}
						/>
						<TextField
							label='Nama tipe akun'
							autoFocus={!isNew}
							flex
							width={'auto'}
							value={data.name}
							placeholder={'e.g. Kas'}
							validationState={isNameValid ? 'valid' : 'invalid'}
							maxLength={50}
							onChange={(e) => changeData("name", e)}
						/>
					</Flex>
					<TextArea
						label='Keterangan'
						flex
						width={'auto'}
						placeholder={'e.g. Group yang memuat akun-akun kas.'}
						value={data.descriptions}
						maxLength={256}
						onChange={(e) => changeData("descriptions", e)}
					/>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginY={'size-200'}>
					<Flex flex direction={'row'} columnGap={'size-125'}>
						<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isIDValid)}>Save</Button>
						<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
							{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'}
								isDisabled={data.id === 0}
								variant='negative'
								onPress={() => deleteAccType(data)}>Remove</Button>
						</View>
					}
				</Flex>
			</form>
	);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (isNameValid && isIDValid) {

			if (isNew) {
				await insertAccType(data);
			} else {
				await updateAccType(data);
			}
		}
	}

	async function updateAccType(p: iAccType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/acc-type/${accType.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: p })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function insertAccType(p: iAccType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/acc-type/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: p })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteAccType(p: iAccType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/acc-type/${p.id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove', data: p })
			})
			.catch(error => {
				console.log(error)
			})
	}

	function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

}

export default AccTypeForm;
