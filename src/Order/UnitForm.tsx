import React, { FormEvent } from 'react';
import { iUnit } from 'lib/interfaces'
import { Button, ComboBox, Flex, Item, NumberField, TextField, View, Text, ProgressCircle, DialogContainer, ActionButton, Heading, Divider, Form } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
import TypeForm, { initVehicle } from '../component/Vehicle/Form';
import AddIcon from '@spectrum-icons/workflow/Add'
import { useVehicleList, useWarehouseList } from 'lib';

const initUnit: iUnit = {
	orderId: 0,
	nopol: '',
	year: new Date().getFullYear(),
	frameNumber: '',
	machineNumber: '',
	color: '',
	typeId: 0,
	warehouseId: 0
}

type UnitFormOptions = {
	dataUnit: iUnit,
	isNew: boolean,
	callback: (params: { method: string, dataUnit?: iUnit }) => void,
	isReadOnly?: boolean,
}

const UnitForm = (props: UnitFormOptions) => {
	const { dataUnit, callback, isNew, isReadOnly } = props;
	const [data, setData] = React.useState<iUnit>(initUnit)
	const [isDirty, setIsDirty] = React.useState<boolean>(false)
	const [open, setOpen] = React.useState(false)
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
		() => data && data.year && data.year > 1990,
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

	let vehicle = useVehicleList()
 	let houses = useWarehouseList()

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(isNew ? { ...initUnit, orderId: dataUnit.orderId } : dataUnit)
		}

		return () => { isLoaded = false }

	}, [dataUnit, isNew])

	return (
		<View>
			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{open &&
					<View>
						<Heading marginStart={'size-200'}>Tipe Kendaraan</Heading>
						<Divider size='S' />
						<View marginX={'size-50'}>
							<TypeForm vehicle={initVehicle} callback={(e) => {
								if (e.method === 'save' && e.data) {
									const t = e.data
									vehicle.insert(t);
									setData(prev => ({ ...prev, type: t, typeId: t.id }))
									setIsDirty(true)
								}
								setOpen(false)
							}} />
						</View>
					</View>}
			</DialogContainer>

			<div className='div-h2'>DATA ASSET / UNIT</div>

			<Form onSubmit={(e) => handleSubmit(e)} isReadOnly={isReadOnly}>				
				<View>
					{(houses.isLoading || vehicle.isLoading) &&
						<Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
					}
				</View>
				<Flex direction={{ base: 'column', L: 'row' }} marginTop={'size-200'} rowGap='size-50' columnGap={'size-200'}>
					<View flex>
						<Flex flex direction={'column'} rowGap={'size-50'}>
							<Flex flex direction={'row'} columnGap={'size-50'}>
								<ComboBox
									menuTrigger={isReadOnly ? "manual" : "focus"}
									flex
									validationState={isTypeValid ? "valid" : "invalid"}
									width={'auto'}
									labelPosition={'side'}
									labelAlign={'end'}
									label={<View width={{ base: 'size-1600', M: 'size-1000' }}>Tipe</View>}
									placeholder={"e.g. Vario 125"}
									defaultItems={vehicle.items}
									selectedKey={data.typeId}
									onSelectionChange={(e) => {
										setIsDirty(true);
										setData((o) => ({
											...o,
											typeId: +e,
											type: vehicle.getItem(+e)
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
								<ActionButton isDisabled={isReadOnly} onPress={(e) => {
									setOpen(true)
								}
								}><AddIcon size="S" /></ActionButton>
							</Flex>
							<Flex direction={'row'} columnGap={'size-100'}>
								<NumberField
									flex
									labelAlign={'end'}
									labelPosition={'side'}
									label={<View width={{ base: 'size-1600', M: 'size-1000' }}>Tahun</View>}
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
									labelPosition={'side'}
									labelAlign={'end'}
									label={'Warna'}
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

							<TextField
								labelPosition={'side'}
								labelAlign={'end'}
								label={<View width={{ base: 'size-1600', M: 'size-1000' }}>Nomor Polisi</View>}
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
					</View>
					<View flex>
						<Flex flex direction={'column'} rowGap={'size-50'}>
							<ComboBox
								menuTrigger={isReadOnly ? "manual" : "focus"}
								flex
								labelAlign={'end'}
								validationState={isWarehouseValid ? "valid" : "invalid"}
								width={'auto'}
								labelPosition={'side'}
								label={<View width={'size-1600'}>Disimpan di gudang</View>}
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
							<TextField
								labelPosition={'side'}
								label={<View width={'size-1600'}>Nomor rangka</View>}
								flex
								labelAlign={'end'}
								width={{ base: 'auto' }}
								value={data.frameNumber ?? ''}
								maxLength={25}
								onChange={(e) => {
									setIsDirty(true);
									setData(prev => ({ ...prev, frameNumber: e }))
								}}
							/>
							<TextField
								labelPosition={'side'}
								label={<View width={'size-1600'}>Nomor mesin</View>}
								flex
								labelAlign={'end'}
								width={{ base: 'auto' }}
								value={data.machineNumber ?? ''}
								maxLength={25}
								onChange={(e) => {
									setIsDirty(true);
									setData(prev => ({ ...prev, machineNumber: e }))
								}}
							/>
						</Flex>
					</View>
				</Flex>

				<Flex direction={'row'} gap='size-100' marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='secondary'
							isDisabled={!isDirty || !(isNopolValid && isTypeValid && isWarehouseValid && isYearValid)}>Update</Button>
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
								isDisabled={isNew || isReadOnly}
								type='button' alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Clear</Button>
						</View>
					}
				</Flex>
			</Form >
		</View >
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
		console.log(p)

		await axios
			.put(`/unit/${p.orderId}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
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
			.post(`/unit`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
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
			.delete(`/unit/${p.orderId}`, { headers: headers })
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