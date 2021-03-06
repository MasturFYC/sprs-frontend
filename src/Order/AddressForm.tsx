import React, { FormEvent, useState } from 'react';
import { iAddress } from '../lib/interfaces'
import { Button, Flex, TextField, View, Link } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';

const initAddress: iAddress = {
	orderId: 0,
	street: '',
	city: '',
	phone: '',
	cell: '',
	zip: '',
	email: '',
}

type AddressFormOptions = {
	address: iAddress,
	isNew: boolean,
	apiAddress: string,
	title: string,
	callback: (params: { method: string, address?: iAddress }) => void
}

const AddressForm = (props: AddressFormOptions) => {
	const { address, callback, isNew, title, apiAddress } = props;
	const [data, setData] = useState<iAddress>(initAddress);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(isNew ? { ...initAddress, orderId: address.orderId } : address)
		}

		return () => { isLoaded = false }

	}, [address, isNew])

	return (
		<View>
			<div style={{ fontSize: '14px', fontWeight: 700, paddingBottom: '6px' }}>{title}</div>
			{showForm ?

				<form onSubmit={(e) => handleSubmit(e)}>
					<Flex gap='size-50' direction={'column'}>
						<TextField
							flex
							label='Alamat'
							autoFocus
							width={'auto'}
							value={data.street}
							placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
							maxLength={50}
							onChange={(e) => changeData("street", e)}
						/>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
							<TextField
								flex
								label='Kota'
								width={'auto'}
								value={data.city}
								autoComplete='address-level2'
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => changeData("city", e)}
							/>
							<TextField
								flex
								label='Telephone'
								width={'auto'}
								value={data.phone}
								placeholder={'e.g. 0234 275572'}
								maxLength={25}
								onChange={(e) => changeData("phone", e)}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
							<TextField
								flex
								label='Cellular'
								width={'auto'}
								autoComplete='tel-national'
								value={data.cell}
								placeholder={'e.g. 0856 9865 9854'}
								maxLength={25}
								onChange={(e) => changeData("cell", e)}
							/>
							<TextField
								flex
								label='Kode pos'
								width={'auto'}
								value={data.zip}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => changeData("zip", e)}
							/>
						</Flex>
						<Flex direction={'row'} gap='size-100' marginTop={'size-200'}>
							<Flex flex direction={'row'} columnGap={'size-100'}>
								<Button type='submit' variant='secondary' isDisabled={!isDirty}>Update</Button>
								<Button type='button' variant='primary'									
									onPress={() => {
										setShowForm(!showForm)
										setData(address)
									}}>
									{isDirty ? 'Cancel' : 'Close'}
								</Button>
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
				</form>
				:
				<View>
					<Link isQuiet variant='primary' onPress={() => setShowForm(!showForm)}>
						{isNew ? 'Buat Alamat' :
							<div>
								<div>{data?.street ? data?.street : '---------'}{data.city ? `, ${data.city}` : ''}
									{data.zip ? ` - ${data.zip}` : ''}
								</div>
								<div>{data.phone ? `Telp. ${data.phone}` : ''}
									{data.cell && data.phone ? ` / ` : ''}
									{data.cell && data.phone === '' ? `Cellular: ` : ''}
									{data.cell ?? ''}
								</div>
							</div>}
					</Link>
				</View>
			}
		</View>
	);

	function changeData(fieldName: string, value: string) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}
	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if (isNew) {
			await inserData(data);
		} else {
			await updateData(data);
		}

		setShowForm(!showForm)
	}

	async function updateData(p: iAddress) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/${apiAddress}/${p.orderId}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', address: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: iAddress) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/${apiAddress}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', address: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: iAddress) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/${apiAddress}/${p.orderId}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove' })
				setShowForm(!showForm)				
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default AddressForm;