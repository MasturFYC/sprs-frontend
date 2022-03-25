import React, { FormEvent, useState } from 'react';
import { iCustomer } from '../lib/interfaces'
import { Button, Flex, Form, TextField, View } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';

export const initCustomer: iCustomer = {
	orderId: 0,
	name: '',
	agreementNumber: '',
	paymentType: ''
}

type CustomerFormOptions = {
	orderId: number
	isReadOnly?:boolean
}

const CustomerForm = (props: CustomerFormOptions) => {
	const { orderId, isReadOnly } = props;
	const [data, setData] = React.useState<iCustomer>(initCustomer)
	const [oldData, setOldData] = React.useState<iCustomer>(initCustomer)
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
		let isLoaded = false;

		async function load(id: number) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/customers/${id}`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return res ? res : initCustomer
		}

		if (!isLoaded && orderId > 0) {
			load(orderId).then(res => {
				setData(res)
			})
		}

		return () => { isLoaded = true }

	}, [orderId])

	return (
		<Form isReadOnly={isReadOnly} onSubmit={(e) => handleSubmit(e)}>
			<div className='div-h2'>DATA KONSUMEN</div>
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
								setData(oldData);
								setIsDirty(false)
							}}>Cancel</Button>
					</Flex>
					{data.orderId > 0 &&
						<View>
							<Button
								isDisabled={data.orderId === 0 || isReadOnly}
								type='button' alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Clear</Button>
						</View>
					}
				</Flex>
			</Flex>
		</Form>
	);

	function changeData(fieldName: string, value: string | number | undefined | null) {
		setData(o => ({...o, [fieldName]: value}))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (isNameValid && isPaymentValid) {

			if (data.orderId === 0) {
				await inserData({...data, orderId: orderId});
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
			.put(`/customers/${p.orderId}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				setOldData(p)
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
			.post(`/customers`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				changeData("orderId", orderId)
				setOldData({...p, orderId: orderId})
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
			.delete(`/customers/${p.orderId}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				setData(initCustomer)
				setOldData(initCustomer)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default CustomerForm;