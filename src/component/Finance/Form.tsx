import React, { FormEvent } from 'react';
import { iFinance, iFinanceGroup } from '../../lib/interfaces'
import { Button, ComboBox, Flex, Item, TextField, View,  DialogContainer, Heading, Divider, useAsyncList, ProgressCircle, ActionButton } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';
import FinanceGroupForm from './GroupForm';
import AddIcon from '@spectrum-icons/workflow/Add'


export const initFinance: iFinance = {
	id: 0,
	name: '',
	shortName: '',
	street: '',
	city: '',
	phone: '',
	cell: '',
	zip: '',
	email: '',
	groupId: 0
}

type FinanceFormOptions = {
	finance: iFinance,
	callback: (params: { method: string, data?: iFinance }) => void
}

const FinanceForm = (props: FinanceFormOptions) => {
	const { finance, callback } = props;
	const [data, setData] = React.useState<iFinance>(initFinance)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);
	const [open, setOpen] = React.useState(false)
	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 5,
		[data]
	)

	const isShortNameValid = React.useMemo(
		() => data && data.shortName && data.shortName.length >= 3,
		[data]
	)

	const isGroupValid = React.useMemo(
		() => data.groupId > 0,
		[data]
	)


	let groups = useAsyncList<iFinanceGroup>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/finance-group", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})

			return { items: res ? res : [] }
		},
		getKey: (item: iFinanceGroup) => item.id
	})

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(finance)
		}

		return () => { isLoaded = false }

	}, [finance])


	if (groups.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{open &&
					<View>
						<Heading marginStart={'size-200'}>Group Finance</Heading>
						<Divider size='S' />
						<View marginX={'size-200'}>
							<FinanceGroupForm group={{ id: 0, name: '' }}
								onCancel={() => setOpen(false)}
								onInsert={(e) => {
									groups.append(e)
									setData(o=>({...o, groupId: e.id}))
									setOpen(false)
									setIsDirty(true)
								}}
								onUpdate={(id, e) => {
									groups.update(id, e)
									setOpen(false)
								}}
								onDelete={(id) => {
									groups.remove(id)
									setOpen(false)
								}}
							/>
						</View>
					</View>}
			</DialogContainer>
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
								flex={{base: 1, L:"none"}}
								label='Singkatan'
								width={{base: 'auto', L:'25%'}}
								value={data.shortName}
								placeholder={'e.g. ADMF'}
								validationState={isShortNameValid ? "valid" : "invalid"}
								maxLength={50}
								onChange={(e) => changeData("shortName", e)}
							/>
							<View width={{ base: 'auto', L: '25%' }}>
							<Flex flex={{ base: 1, L: "none" }} direction={'row'} columnGap={'size-50'}>
								<ComboBox
									menuTrigger="focus"
									flex
									validationState={isGroupValid ? "valid" : "invalid"}
									width={{ base: 'auto', L: '25%' }}
									label={'Group'}
									placeholder={"e.g. BAF"}
									defaultItems={groups.items}
									selectedKey={data.groupId}
									onSelectionChange={(e) => {
										setIsDirty(true);
										setData((o) => ({
											...o,
											groupId: +e
										}))
									}}
								>
									{(item) => <Item>{item.name}</Item>}
								</ComboBox>
								<ActionButton alignSelf={'flex-end'} onPress={(e) => {
									setOpen(true)
								}
								}><AddIcon size="S" /></ActionButton>
							</Flex>
							</View>
						</Flex>

						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								label='Alamat'
								width={'auto'}
								value={data.street || ""}
								placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
								maxLength={50}
								onChange={(e) => changeData("street", e)}
							/>
							<TextField
								flex
								label='Kota'
								width={'auto'}
								value={data.city || ""}
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
								value={data.phone || ""}
								placeholder={'e.g. 0234 275572'}
								maxLength={25}
								onChange={(e) => changeData("phone", e)}
							/>
							<TextField
								flex
								label='Cellular'
								width={'auto'}
								value={data.cell || ""}
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
								value={data.zip || ""}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => changeData("zip", e)}
							/>
							<TextField
								flex
								type={'email'}
								label='e-mail'
								width={'auto'}
								value={data.email || ""}
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
		</View>

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
				callback({ method: 'remove', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default FinanceForm;