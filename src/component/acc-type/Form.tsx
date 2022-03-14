import React, { FormEvent } from 'react';
import { iAccGroup, iAccType } from '../../lib/interfaces'
import { Button, ComboBox, Flex, Text, Item, NumberField, TextArea, TextField, View } from '@adobe/react-spectrum';

export const initAccType: iAccType = {
	groupId: 0,
	id: 0,
	name: '',
	descriptions: ''
}

type AccTypeFormOptions = {
	accType: iAccType,
	isNew: boolean,
	groups: iAccGroup[],
	onInsert: (data: iAccType) => void,
	onCancel: (id: number) => void,
	onUpdate: (id: number, data: iAccType) => void,
	onDelete: (id: number) => void,
}

const AccTypeForm = (props: AccTypeFormOptions) => {
	const { accType, groups, onInsert, onCancel, onDelete, onUpdate, isNew } = props;
	const [data, setData] = React.useState<iAccType>(initAccType)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isIDValid = React.useMemo(
		() => data.id > 10 && data.id < 100,
		[data]
	)

	const isGroupValid = React.useMemo(
		() => data.groupId > 0,
		[data]
	)

	const isNameValid = React.useMemo(
		() => data.name.length > 2,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		if (isLoaded) {
			setData(accType)
		}

		return () => { isLoaded = false }

	}, [accType])

	return (
			<form onSubmit={(e) => handleSubmit(e)}>
				<Flex rowGap='size-50' direction={'column'}>
					<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap='size-50'>
					<ComboBox
						flex
						autoFocus={isNew}
						menuTrigger='focus'
						validationState={isGroupValid ? "valid" : "invalid"}
						width={'auto'}
						label={"Group akun"}
						placeholder={"Pilih group"}
						defaultItems={groups}
						selectedKey={data.groupId}
						onSelectionChange={(e) => handleChange("groupId", +e)}
					>
						{(item) => <Item textValue={`${item.id} - ${item.name}`}>
							<Text><span className="font-bold">{item.id} - {item.name}</span></Text>
							<Text slot='description'>{item.descriptions}</Text>
						</Item>}
					</ComboBox>

						<NumberField
							label='Nomor tipe akun'
							autoFocus={isNew}
							isReadOnly={!isNew}
							formatOptions={{ useGrouping: false }}
							hideStepper={true}
							validationState={isIDValid ? 'valid' : 'invalid'}
							width={{ base: 'auto', M: '120px' }}
							value={data.id}
							onChange={(e) => handleChange("id", e)}
						/>
						<TextField
							label='Nama tipe akun'
							autoFocus={!isNew}
							flex
							width={'auto'}
							value={data.name}
							placeholder={'e.g. Kas'}
							validationState={isNameValid ? 'valid' : 'invalid'}
							maxLength={50}
							onChange={(e) => handleChange("name", e)}
						/>
					</Flex>
					<TextArea
						label='Keterangan'
						flex
						width={'auto'}
						placeholder={'e.g. Group yang memuat akun-akun kas.'}
						value={data.descriptions}
						maxLength={256}
						onChange={(e) => handleChange("descriptions", e)}
					/>
				</Flex>
				<Flex direction={'row'} gap='size-100' marginY={'size-200'}>
					<Flex flex direction={'row'} columnGap={'size-125'}>
						<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isIDValid)}>Save</Button>
						<Button type='button' variant='primary' onPress={() => onCancel(accType.id)}>
							{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'}
								isDisabled={data.id === 0}
								variant='negative'
								onPress={() => onDelete(accType.id)}>Remove</Button>
						</View>
					}
				</Flex>
			</form>
	);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if(accType.id === 0) {
			onInsert(data)
		} else {
			onUpdate(accType.id, data)
		}

	}
	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}
}

export default AccTypeForm;
