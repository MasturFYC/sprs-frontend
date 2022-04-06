import React, { FormEvent } from 'react';
import { iType } from '../../lib/interfaces'
import { Button, Flex, Picker, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';
import { Item } from "@react-spectrum/combobox";
import { useMerkList } from 'lib/useMerk';
import { useWheelList } from 'lib/useWheel';

export const initVehicle: iType = {
	id: 0,
	name: '',
	wheelId: 0,
	merkId: 0
}

type TypeFormOptions = {
	vehicle: iType,
	callback: (params: { method: string, data?: iType }) => void
}

const TypeForm = (props: TypeFormOptions) => {
	const { vehicle, callback } = props;
	const [data, setData] = React.useState<iType>(initVehicle)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isNameValid = React.useMemo(() => data.name.length > 2, [data])
	const isWheelValid = React.useMemo(() => data.wheelId > 0, [data])
	const isMerkValid = React.useMemo(() => data.merkId > 0, [data])

	let wheels = useWheelList()
	let merks = useMerkList()

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(vehicle)
		}

		return () => { isLoaded = false }

	}, [vehicle])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<View backgroundColor={'gray-100'} padding={{ base: 'size-50', M: 'size-200' }}>
				<Flex gap='size-200' direction={'column'}>
					<TextField
						flex
						autoFocus
						label='Nama tipe kendaraan'
						width={'auto'}
						value={data.name}
						placeholder={'e.g. NMax 155'}
						validationState={isNameValid ? "valid" : "invalid"}
						maxLength={50}
						onChange={(e) => changeData("name", e)}
					/>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<Picker
							width={'auto'}
							flex
							validationState={isWheelValid ? "valid" : "invalid"}
							label="Roda"
							placeholder={'e.g. R2'}
							selectedKey={data.wheelId}
							items={wheels.items}
							onSelectionChange={(e) => {
								setIsDirty(true);
								setData((o) => ({
									...o,
									wheelId: +e,
									wheel: wheels.getItem(+e)
								}))
							}}
						>
							{(item) => <Item textValue={item.name}>{item.shortName}</Item>}
						</Picker>
						<Picker
							label="Merk"
							flex
							validationState={isMerkValid ? "valid" : "invalid"}
							width={'auto'}
							selectedKey={data.merkId}
							placeholder={'e.g. Yamaha'}
							items={merks.items}
							onSelectionChange={(e) => {
								setIsDirty(true)
								setData((o) => ({
									...o,
									merkId: +e,
									merk: merks.getItem(+e)
								}))
							}}
						>
							{(item) => <Item textValue={item.name}>{item.name}</Item>}
						</Picker>
					</Flex>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isMerkValid && isWheelValid)}>Save</Button>
						<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>
							{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'} variant='negative'
								isDisabled={data.id === 0} onPress={() => deleteData(data)}>Remove</Button>
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
		if (data.name.trim().length === 0) {
			return
		}

		if (data.id === 0) {
			await inserData(data);
		} else {
			await updateData(data);
		}
	}

	async function updateData(vehicle: iType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(vehicle)

		await axios
			.put(`/types/${vehicle.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: vehicle })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(vehicel: iType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(vehicel)

		await axios
			.post(`/types`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(vehicel: iType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/types/${vehicel.id}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default TypeForm;