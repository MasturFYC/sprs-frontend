import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iLoan } from 'lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';

const initLoan: iLoan = {
	id: 0,
	name: '',
	loanAt: dateParam(null)
}

type LoanFormProps = {
	data: iLoan
	onInsert?: (loan: iLoan) => void
	onUpdate?: (id: number, loan: iLoan) => void
	onDelete?: (id: number) => void
	onCancel?: (id: number) => void
} 

const LoanForm = ({data, onInsert, onUpdate, onDelete, onCancel}: LoanFormProps) => {
	const [loan, setLoan] = useState<iLoan>(initLoan)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isNameValid = React.useMemo(
		() => loan.name.length >= 3,
		[loan]
	)

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
		
			setLoan(data);
		}

		return () => { isLoaded = true }

	}, [data])


	return (
		<View>

			<form onSubmit={(e) => handleSubmit(e)}>
				<View  padding={{ base: 'size-50', M: 'size-200' }}>
					<Flex gap='size-200' direction={'column'}>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								autoFocus
								label={<div className='width-70'>Nama</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.name}
								placeholder={'e.g. Junaedi'}
								validationState={isNameValid ? "valid" : "invalid"}
								maxLength={50}
								onChange={(e) => handleChange("name", e)}
							/>
							<TextField
								flex
								type={'date'}
								label={<div className='width-70'>Tanggal</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={dateOnly(loan.loanAt)}
								onChange={(e) => handleChange("orderAt", e)}
							/>
						
						</Flex>
						<TextField
								flex
								label={<div className='width-70'>Alamat</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.street}
								placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
								maxLength={50}
								onChange={(e) => handleChange("street", e)}
							/>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								label={<div className='width-70'>Kota</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.city}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => handleChange("city", e)}
							/>
							<TextField
								flex
								label={<div className='width-70'>Telephone</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.phone}
								placeholder={'e.g. 0234 275572'}
								maxLength={25}
								onChange={(e) => handleChange("phone", e)}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								label={<div className='width-70'>Cellular</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.cell}
								placeholder={'e.g. 0856 9865 9854'}
								maxLength={25}
								onChange={(e) => handleChange("cell", e)}
							/>
							<TextField
								flex
								label={<div className='width-70'>Kode pos</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.zip}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => handleChange("zip", e)}
							/>
						</Flex>
					</Flex>
					<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
						<Flex flex direction={'row'} columnGap={'size-100'}>
							<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid)}>Save</Button>
							<Button type='button' variant='primary' onPress={() => onCancel && onCancel(loan.id)}>
								{isDirty ? 'Cancel' : 'Close'}</Button>
						</Flex>
						{loan.id > 0 &&
							<View>
								<Button type='button'
									isDisabled={loan.id === 0}
									alignSelf={'flex-end'} variant='negative'
									onPress={() => deleteData(loan.id)}>Remove</Button>
							</View>
						}
					</Flex>
				</View>
			</form>
		</View>

	);

	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setLoan(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (!isNameValid) {
			return
		}

		

		if (loan.id === 0) {
			await inserData(loan);
		} else {
			await updateData(loan);
		}
	}

	async function updateData(p: iLoan) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/loans/${p.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onUpdate && onUpdate(loan.id, loan)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: iLoan) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/loans`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onInsert && onInsert({...loan, id: data.id})
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: number) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/loans/${p}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onDelete && onDelete(loan.id)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default LoanForm;