import React, { FormEvent, useState } from 'react';
import { iCustomer } from '../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';

export const initCustomer: iCustomer = {
	orderId: 0,
	name: '',
	agreementNumber: '',
	paymentType: ''
}

type CustomerFormOptions = {
	customer: iCustomer,
	isNew: boolean,
	callback: (params: { method: string, customer?: iCustomer }) => void
}

const CustomerForm = (props: CustomerFormOptions) => {
	const { customer, callback, isNew } = props;
	const [data, setData] = React.useState<iCustomer>(initCustomer)
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 0,
		[data]
	)
	// const isAgreementValid = React.useMemo(
	//     () => data && data.agreementNumber && data.agreementNumber.length > 0,
	//     [data]
	// )
	const isPaymentValid = React.useMemo(
		() => data && data.paymentType && data.paymentType.length > 0,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(customer)
		}

		return () => { isLoaded = false }

	}, [customer])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<h3>DATA KONSUMEN</h3>
			<Flex direction={'column'} columnGap='size-200' rowGap='size-50'>
				<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
					<TextField
						validationState={isNameValid ? 'valid' : 'invalid'}
						label='Nama konsumen'
						flex
						placeholder='e.g. Wardiman'
						autoComplete='name'
						width={{ base: 'auto' }}
						value={data.name}
						maxLength={50}
						onChange={(e) => changeData("name", e )}
					/>
					<TextField
						flex
						label='Nomor perjanjian'
						// validationState={isAgreementValid ? 'valid' : 'invalid'}
						width={'auto'}
						placeholder='e.g. XXX-XXXX-XXXXXXXXX'
						value={data.agreementNumber || ''}
						maxLength={25}
						onChange={(e) => changeData("agreementNumber", e )}
					/>
					<TextField
						label='Jenis pembayaran'
						width={{ base: 'auto', M: '25%' }}
						value={data.paymentType}
						placeholder='e.g. CO-1'
						validationState={isPaymentValid ? 'valid' : 'invalid'}
						maxLength={25}
						onChange={(e) => changeData("paymentType", e)}
					/>
				</Flex>
				<Flex direction={'row'} columnGap='size-200' rowGap='size-50' marginTop={'size-200'}>
					<Flex flex direction={'row'} columnGap='size-100'>
						<Button type='submit' 
						isDisabled={!isDirty || !(isNameValid && isPaymentValid)}
						variant='secondary'>Update</Button>
						<Button type='button' variant='primary'
							isDisabled={!isDirty}
							onPress={() => {
								setData(customer);
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
		</form>
	);

	function changeData(fieldName: string, value: string | number | undefined | null) {
		setData(o => ({...o, [fieldName]: value}))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (isNameValid && isPaymentValid) {

			if (isNew) {
				await inserData(data);
			} else {
				await updateData(data);
			}
		}
	}

	async function updateData(p: iCustomer) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/customers/${p.orderId}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				//console.log(data)
				callback({ method: 'save', customer: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: iCustomer) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/customers/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', customer: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: iCustomer) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/customers/${p.orderId}/`, { headers: headers })
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

export default CustomerForm;