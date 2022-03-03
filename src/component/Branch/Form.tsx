import React, { FormEvent } from 'react';
import { iBranch } from '../interfaces'
import { Button, Flex, Picker, TextField, useAsyncList, View } from '@adobe/react-spectrum';
import axios from '../axios-base';
import { Item } from "@react-spectrum/combobox";

export const initBranch: iBranch = {
	id: 0,
	name: '',
	headBranch: ''
}

type BranchFormOptions = {
	branch: iBranch,
	callback: (params: { method: string, data?: iBranch }) => void
}

const BranchForm = (props: BranchFormOptions) => {
	const { branch, callback } = props;
	const [data, setData] = React.useState<iBranch>(initBranch)
	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 0,
		[data]
	)
	const isHeadValid = React.useMemo(
		() => data && data.headBranch && data.headBranch.length > 0,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(branch)
		}

		return () => { isLoaded = false }

	}, [branch])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<View backgroundColor={'gray-100'} padding={{ base: 'size-50', M: 'size-200' }}>
				<Flex gap='size-200' direction={'column'}>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							autoFocus
							label='Nama cabang'
							width={'auto'}
							value={data.name}
							placeholder={'e.g. Jatibarang'}
							validationState={isNameValid ? "valid" : "invalid"}
							maxLength={50}
							onChange={(e) => setData(prev => ({
								...prev,
								name: e,
							}))}
						/>
						<TextField
							flex
							label='Nama Kepala Cabang'
							width={'auto'}
							value={data.headBranch}
							placeholder={'e.g. Junaedi, S.E'}
							validationState={isHeadValid ? "valid" : "invalid"}
							maxLength={50}
							onChange={(e) => setData(prev => ({
								...prev,
								headBranch: e,
							}))}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Alamat'
							width={'auto'}
							value={data.street}
							placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
							maxLength={50}
							onChange={(e) => setData(prev => ({
								...prev,
								street: e,
							}))}
						/>
						<TextField
							flex
							label='Kota'
							width={'auto'}
							value={data.city}
							placeholder={'e.g. Indramayu'}
							maxLength={50}
							onChange={(e) => setData(prev => ({
								...prev,
								city: e,
							}))}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Telpephone'
							width={'auto'}
							value={data.phone}
							placeholder={'e.g. 0234 275572'}
							maxLength={25}
							onChange={(e) => setData(prev => ({
								...prev,
								phone: e,
							}))}
						/>
						<TextField
							flex
							label='Cellular'
							width={'auto'}
							value={data.cell}
							placeholder={'e.g. 0856 9865 9854'}
							maxLength={25}
							onChange={(e) => setData(prev => ({
								...prev,
								cell: e,
							}))}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
						<TextField
							flex
							label='Kode pos'
							width={'auto'}
							value={data.zip}
							placeholder={'e.g. 45215'}
							maxLength={10}
							onChange={(e) => setData(prev => ({
								...prev,
								zip: e,
							}))}
						/>
						<TextField
							flex
							type={'email'}
							label='e-mail'
							width={'auto'}
							value={data.email}
							placeholder={'e.g. 0856 9865 9854'}
							maxLength={50}
							onChange={(e) => setData(prev => ({
								...prev,
								email: e,
							}))}
						/>
					</Flex>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta'>Save</Button>
						<Button type='button' variant='primary'
							onPress={() => callback({ method: 'cancel' })}>Cancel</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Remove</Button>
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

	async function updateData(branch: iBranch) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(branch)

		await axios
			.put(`/branchs/${branch.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: branch })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(branch: iBranch) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(branch)

		await axios
			.post(`/branchs/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(branch: iBranch) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/branchs/${branch.id}/`, { headers: headers })
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

export default BranchForm;