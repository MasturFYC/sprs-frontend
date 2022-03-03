import React, { FormEvent } from 'react';
import { iWarehouse } from '../interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../axios-base';

export const initWarehouse: iWarehouse = {
	id: 0,
	name: '',
	descriptions: ''
}

type WarehouseFormOptions = {
	warehouse: iWarehouse,
	callback: (params: { method: string, data?: iWarehouse }) => void
}

const WarehouseForm = (props: WarehouseFormOptions) => {
	const { warehouse, callback } = props;
	const [data, setData] = React.useState<iWarehouse>(initWarehouse)
	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 0,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(warehouse)
		}

		return () => { isLoaded = false }

	}, [warehouse])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<Flex gap='size-200' direction={{ base: 'column', M: 'row' }}>
				<TextField label='Nama gudang'
					width={{ base: '100%' }}
					autoFocus
					value={data.name}
					validationState={isNameValid ? "valid" : "invalid"}
					maxLength={50}
					onChange={(e) => setData(prev => ({ ...prev, name: e }))}
				/>
				<TextField label='Lokasi'
					width={{ base: '100%' }}
					value={data.descriptions}
					maxLength={128}
					onChange={(e) => setData(prev => ({ ...prev, descriptions: e }))}
				/>
			</Flex>
			<Flex direction={'row'} gap='size-100' marginY={'size-200'}>
				<Flex flex direction={'row'} columnGap={'size-100'}>
					<Button type='submit' variant='cta'>Save</Button>
					<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>Cancel</Button>
				</Flex>
				{data.id > 0 &&
					<View>
						<Button type='button' alignSelf={'flex-end'} variant='negative' onPress={() => deleteWarehouse(data)}>Remove</Button>
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
			await insertWarehouse(data);
		} else {
			await updateWarehouse(data);
		}
	}

	async function updateWarehouse(warehouse: iWarehouse) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(warehouse)

		await axios
			.put(`/warehouses/${warehouse.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: warehouse })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function insertWarehouse(warehouse: iWarehouse) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(warehouse)

		await axios
			.post(`/warehouses/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteWarehouse(warehouse: iWarehouse) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/warehouses/${warehouse.id}/`, { headers: headers })
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

export default WarehouseForm;