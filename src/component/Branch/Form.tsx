import React, { FormEvent, useState } from 'react';
import { iBranch } from '../../lib/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../../lib/axios-base';

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
	const [data, setData] = useState<iBranch>(initBranch)
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const isNameValid = React.useMemo(
		() => data.name.length > 5,
		[data]
	)
	const isHeadValid = React.useMemo(
		() => data.headBranch.length > 5,
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
							onChange={(e) => changeData("name", e)}
						/>
						<TextField
							flex
							label='Nama Kepala Cabang'
							width={'auto'}
							value={data.headBranch}
							placeholder={'e.g. Junaedi, S.E'}
							validationState={isHeadValid ? "valid" : "invalid"}
							maxLength={50}
							onChange={(e) => changeData("headBranch", e)}
						/>
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
						<Button type='submit' variant='cta'
						isDisabled={!isDirty || !(isHeadValid && isNameValid)}>Save</Button>
						<Button type='button' variant='primary'
							onPress={() => callback({ method: 'cancel' })}>
								{isDirty ? 'Cancel' : 'Close'}
							</Button>
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
			.put(`/branchs/${branch.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: branch })
			})
			.catch(error => {
				console.log(error)
			})
	}

	
	function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function inserData(branch: iBranch) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(branch)

		await axios
			.post(`/branchs`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
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
			.delete(`/branchs/${branch.id}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove', data: branch })
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default BranchForm;