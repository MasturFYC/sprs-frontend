import React, { FormEvent } from 'react';
import { iFinance } from '../../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';
//import { Item } from "@react-spectrum/combobox";

export const initFinance: iFinance = {
	id: 0,
	name: '',
	shortName: '',
	street: '',
	city: '',
	phone: '',
	cell: '',
	zip: '',
	email: ''
}

type FinanceFormOptions = {
	finance: iFinance,
	callback: (params: { method: string, data?: iFinance }) => void
}

const FinanceForm = (props: FinanceFormOptions) => {
	const { finance, callback } = props;
	const [data, setData] = React.useState<iFinance>(initFinance)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 5,
		[data]
	)
	const isShortNameValid = React.useMemo(
		() => data && data.shortName && data.shortName.length >= 3,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(finance)
		}

		return () => { isLoaded = false }

	}, [finance])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<View backgroundColor={'gray-100'} padding={{ base: 'size-50', M: 'size-200' }}>
				<Flex gap='size-200' direction={'column'}>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							autoFocus
							label='Nama Finance'
							width={'auto'}
							value={data.name}
							placeholder={'e.g. PT Adira Dinamika Multi Finance'}
							validationState={isNameValid ? "valid" : "invalid"}
							maxLength={50}
							onChange={(e) => changeData("name", e)}
						/>
						<TextField
							flex
							label='Singkatan'
							width={'auto'}
							value={data.shortName}
							placeholder={'e.g. ADMF'}
							validationState={isShortNameValid ? "valid" : "invalid"}
							maxLength={50}
							onChange={(e) => changeData("shortName", e)}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Alamat'
							width={'auto'}
							value={data.street}
							placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
							maxLength={50}
							onChange={(e) => changeData("street", e)}
						/>
						<TextField
							flex
							label='Kota'
							width={'auto'}
							value={data.city}
							placeholder={'e.g. Indramayu'}
							maxLength={50}
							onChange={(e) => changeData("city", e)}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Telephone'
							width={'auto'}
							value={data.phone}
							placeholder={'e.g. 0234 275572'}
							maxLength={25}
							onChange={(e) => changeData("phone", e)}
						/>
						<TextField
							flex
							label='Cellular'
							width={'auto'}
							value={data.cell}
							placeholder={'e.g. 0856 9865 9854'}
							maxLength={25}
							onChange={(e) => changeData("cell", e)}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Kode pos'
							width={'auto'}
							value={data.zip}
							placeholder={'e.g. 45215'}
							maxLength={10}
							onChange={(e) => changeData("zip", e)}
						/>
						<TextField
							flex
							type={'email'}
							label='e-mail'
							width={'auto'}
							value={data.email}
							placeholder={'e.g. 0856 9865 9854'}
							maxLength={50}
							onChange={(e) => changeData("email", e)}
						/>
					</Flex>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isShortNameValid)}>Save</Button>
						<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
							{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button'
								isDisabled={data.id === 0}
								alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Remove</Button>
						</View>
					}
				</Flex>
			</View>
		</form>
	);

	function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (!isNameValid || !isShortNameValid) {
			return
		}

		if (data.id === 0) {
			await inserData(data);
		} else {
			await updateData(data);
		}
	}

	async function updateData(finance: iFinance) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(finance)

		await axios
			.put(`/finances/${finance.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: finance })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(finance: iFinance) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(finance)

		await axios
			.post(`/finances/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(finance: iFinance) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/finances/${finance.id}/`, { headers: headers })
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

export default FinanceForm;