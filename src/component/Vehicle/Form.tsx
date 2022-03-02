import React, { FormEvent } from 'react';
import { iVehicle, iWheel, iMerk } from '../interfaces'
import { Button, Flex, Picker, TextField, useAsyncList, View } from '@adobe/react-spectrum';
import axios from 'axios';
import { Item } from "@react-spectrum/combobox";

export const initVehicle: iVehicle = {
	id: 0,
	name: '',
	wheelId: 0,
	merkId: 0
}

type VehicleFormOptions = {
	vehicle: iVehicle,
	callback: (params: { method: string, data?: iVehicle }) => void
}

const VehicleForm = (props: VehicleFormOptions) => {
	const { vehicle, callback } = props;
	const [data, setData] = React.useState<iVehicle>(initVehicle)
	let wheels = useAsyncList<iWheel>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("http://pixel.id:8181/api/wheels/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log(error)
				})

			return { items: [{ id: 0, name: '', shortName: 'Pilih Roda' }, ...res] }
		},
		getKey: (item: iWheel) => item.id
	})
	let merks = useAsyncList<iMerk>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("http://pixel.id:8181/api/merks/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					//console.log(data)
					return data
				})
				.catch(error => {
					console.log(error)
				})
			return { items: [{ id: 0, name: 'Pilih merk' }, ...res] }
		},
		getKey: (item: iMerk) => item.id
	})

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(vehicle)
		}

		return () => { isLoaded = false }

	}, [vehicle])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<View backgroundColor={'gray-100'} padding={'size-200'}>
				<Flex gap='size-200' direction={'column'}>
					<TextField label='Nama tipe kendaraan'
						flex
						width={'auto'}
						value={data.name}
						isRequired
						maxLength={10}
						onChange={(e) => setData(prev => ({
							...prev,
							name: e,
						}))}
					/>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<Picker
							isRequired
							label="Merk"
							flex
							width={'auto'}
							selectedKey={data.merkId}
							items={merks.items}
							onSelectionChange={(e) =>
								setData((o) => ({
									...o,
									merkId: +e,
									merk: merks.getItem(e)
								}))
							}
						>
							{(item) => <Item textValue={item.name}>{item.name}</Item>}
						</Picker>
						<Picker
							isRequired
							width={'auto'}
							flex
							label="Roda"
							selectedKey={data.wheelId}
							items={wheels.items}
							onSelectionChange={(e) =>
								setData((o) => ({
									...o,
									wheelId: +e,
									wheel: wheels.getItem(e)
								}))
							}
						>
							{(item) => <Item textValue={item.name}>{item.shortName}</Item>}
						</Picker>
					</Flex>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginY={'size-200'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta'>Save</Button>
						<Button type='button' variant='primary' onPress={() => callback({ method: 'cancel' })}>Cancel</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'} variant='negative' onPress={() => deleteData(data)}>Remove</Button>
						</View>
					}
				</Flex>
			</View>
		</form>
	);

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

	async function updateData(vehicle: iVehicle) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(vehicle)

		await axios
			.put(`http://pixel.id:8181/api/types/${vehicle.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: vehicle })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(vehicel: iVehicle) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(vehicel)

		await axios
			.post(`http://pixel.id:8181/api/types/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(vehicel: iVehicle) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`http://pixel.id:8181/api/types/${vehicel.id}/`, { headers: headers })
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

export default VehicleForm;