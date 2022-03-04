import React, { FormEvent } from 'react';
import { iType, iUnit, iWarehouse } from '../component/interfaces'
import { Button, ComboBox, Flex, Item, NumberField, TextField, useAsyncList, View, Text, ProgressCircle } from '@adobe/react-spectrum';
import axios from '../component/axios-base';

export const initUnit: iUnit = {
	orderId: 0,
	nopol: '',
	year: new Date().getFullYear(),
	frameNumber: '',
	machineNumber: '',
	bpkbName: '',
	color: '',
	dealer: '',
	typeId: 0,
	warehouseId: 0
}

type UnitFormOptions = {
	dataUnit: iUnit,
	isNew: boolean,
	callback: (params: { method: string, dataUnit?: iUnit }) => void
}

const UnitForm = (props: UnitFormOptions) => {
	const { dataUnit, callback, isNew } = props;
	const [data, setData] = React.useState<iUnit>(initUnit)
	const [isDirty, setIsDirty] = React.useState<boolean>(false)

	const isNopolValid = React.useMemo(
		() => {

			if (data.nopol.length >= 7) {
				return true
			}

			return false;
		},
		[data]
	)

	const isYearValid = React.useMemo(
		() => data && data.year && data.year > 0,
		[data]
	)
	const isTypeValid = React.useMemo(
		() => data && data.typeId > 0,
		[data]
	)
	const isWarehouseValid = React.useMemo(
		() => data && data.warehouseId > 0,
		[data]
	)
	let types = useAsyncList<iType>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/types/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log(error)
					return [];
				})

			return { items: res }
		},
		getKey: (item: iType) => item.id
	})

	let houses = useAsyncList<iWarehouse>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/warehouses/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log(error)
					return [];
				})

			return { items: res }
		},
		getKey: (item: iWarehouse) => item.id
	})

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(isNew ? { ...initUnit, orderId: dataUnit.orderId } : dataUnit)
		}

		return () => { isLoaded = false }

	}, [dataUnit, isNew])

	if (houses.isLoading || types.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<h3>DATA ASSET / UNIT</h3>
			<Flex gap='size-100' direction={'column'}>
				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap='size-100' columnGap={'size-200'}>
					<ComboBox
						menuTrigger="focus"
						flex
						validationState={isTypeValid ? "valid" : "invalid"}
						width={'auto'}
						label={"Tipe"}
						placeholder={"e.g. Vario 125"}
						defaultItems={types.items}
						selectedKey={data.typeId}
						onSelectionChange={(e) => {
							setIsDirty(true);
							setData((o) => ({
								...o,
								typeId: +e,
								type: types.getItem(+e)
							}))
						}}
					>
						{(item) => <Item textValue={item.name}>
							<Text>{item.name}</Text>
							<Text slot='description'>
								{item.merk ? item.merk.name : ''}{' - '}
								{item.wheel ? item.wheel.name : ''}
							</Text>
						</Item>}
					</ComboBox>
					<ComboBox
						menuTrigger="focus"
						flex
						validationState={isWarehouseValid ? "valid" : "invalid"}
						width={'auto'}
						label={"Disimpan di gudang"}
						placeholder={"e.g. Gudang Pusat"}
						defaultItems={houses.items}
						selectedKey={data.warehouseId}
						onSelectionChange={(e) => {
							setIsDirty(true);
							setData((o) => ({
								...o,
								warehouseId: +e,
								warehouse: houses.getItem(+e)
							}))
						}}
					>
						{(item) => <Item textValue={item.name}>
							<Text>{item.name}</Text>
							<Text slot='description'>
								{item.descriptions ?? '-'}
							</Text>
						</Item>}
					</ComboBox>
				</Flex>
				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap='size-100' columnGap={'size-200'}>
					<NumberField
						flex
						label='Tahun'
						formatOptions={{ useGrouping: false }}
						hideStepper={true}
						validationState={isYearValid ? 'valid' : 'invalid'}
						width={'auto'}
						value={data.year}
						onChange={(e) => {
							setIsDirty(true);
							setData((prev) => ({ ...prev, year: e }))
						}}
					/>
					<TextField
						label='Warna'
						flex
						width={{ base: 'auto' }}
						value={data.color ?? ''}
						maxLength={50}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, color: e }))
						}}
					/>
				</Flex>
				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap='size-100' columnGap={'size-200'}>
					<TextField
						label='Nomor rangka'
						flex
						width={{ base: 'auto' }}
						value={data.frameNumber ?? ''}
						maxLength={25}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, frameNumber: e }))
						}}
					/>
					<TextField
						label='Nomor mesin'
						flex
						width={{ base: 'auto' }}
						value={data.machineNumber ?? ''}
						maxLength={25}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, machineNumber: e }))
						}}
					/>
				</Flex>
				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap='size-100' columnGap={'size-200'}>
					<TextField
						label='Nama BPKB'
						flex
						width={{ base: 'auto' }}
						value={data.bpkbName ?? ''}
						maxLength={50}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, bpkbName: e }))
						}}
					/>
					<TextField
						label='Nomor Polisi'
						flex
						validationState={isNopolValid ? 'valid' : 'invalid'}
						width={{ base: 'auto' }}
						value={data.nopol}
						maxLength={15}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, nopol: e.toUpperCase() }))
						}}
					/>
				</Flex>
				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap='size-100' columnGap={'size-200'}>
					<TextField
						label='Dealer'
						flex
						width={{ base: 'auto' }}
						value={data.dealer ?? ''}
						maxLength={50}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, dealer: e }))
						}}
					/>
					<TextField
						label='Surveyor'
						flex
						width={{ base: 'auto' }}
						value={data.surveyor}
						maxLength={50}
						onChange={(e) => {
							setIsDirty(true);
							setData(prev => ({ ...prev, surveyor: e }))
						}}
					/>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginTop={'size-200'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='secondary'
							isDisabled={!isDirty}>Update</Button>
						<Button type='button' variant='primary'
							isDisabled={!isDirty}
							onPress={() => {
								setData(dataUnit);
								setIsDirty(false)
							}}>Cancel</Button>
					</Flex>
					{data.orderId > 0 &&
						<View>
							<Button
								isDisabled={isNew}
								type='button' alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Clear</Button>
						</View>
					}
				</Flex>
			</Flex>
		</form >
	);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if (isWarehouseValid && isYearValid && isTypeValid) {

			if (isNew) {
				await inserData(data);
			} else {
				await updateData(data);
			}
		}
	}

	async function updateData(p: iUnit) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/units/${p.orderId}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				//console.log(data)
				callback({ method: 'save', dataUnit: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: iUnit) {

		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/units/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				//console.log(data)
				callback({ method: 'save', dataUnit: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: iUnit) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/units/${p.orderId}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove' })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default UnitForm;