import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../lib/axios-base";
import { iAccType } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, Divider, Flex, Link } from "@adobe/react-spectrum";
import AccTypeForm, { initAccType } from './Form'
import { useAccountGroupList } from "lib/useAccountGroup";
import { useAccountTypeList } from "lib/useAccountType";

const AccType = () => {
	const navigate  = useNavigate();
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	const { id: groupId, name: groupName} = useParams()

	let groups = useAccountGroupList()

	let accs = useAccountTypeList(groupId ? +groupId : 0)

	return (
		<View>
			<View><span className="div-h1">Tipe Akun{groupName ? ` - (Group ${groupName})` : ''}</span></View>

			<View marginY={'size-200'}>
				<Button variant="cta" onPress={() => addNewItem()}>Tipe Akun Baru</Button>
			</View>

			<Divider size="S" marginY='size-100' />

			{accs.items.map(o => {

				return o.id === selectedId ?
					<View key={o.id}
						backgroundColor={'gray-100'}
						marginBottom={'size-400'}
						borderRadius={'medium'}
						borderWidth={'thin'}
						borderColor={'indigo-400'}
						paddingX={'size-200'}
						paddingY={'size-50'}
						width={{ base: 'auto', L: '75%' }}
					>
						<AccTypeForm
							isNew={o.id === 0}
							accType={o}
							groups={groups.items}
							onInsert={(e) => insertAccType(e)}
							onUpdate={(id, e) => updateAccType(id, e)}
							onDelete={(e) => deleteAccType(e)}
							onCancel={(e) => {
								setSelectedId(-1)
								if(e === 0) {
									accs.remove(0)
								}
							}}
						/>
					</View>
					:
					<View key={o.id}>
						<Flex direction={{ base: 'column', L: 'row' }} columnGap='size-200' rowGap='size-50'>
							<View width={{ base: 'auto', M: '25%' }}>
								<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
									onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
									<span>{o.id} - {o.name}</span>
								</Link>
							</View>
							<View flex>
								{o.descriptions} <Link isQuiet variant="primary" onPress={() => navigate(`/acc-code/${o.id}/${o.name}`)}>Lihat akun</Link>
							</View>
						</Flex>
						<Divider size="S" marginY='size-100' />
					</View>
			})}
		</View>
	);


	function addNewItem() {
		if (!accs.getItem(0)) {
			accs.insert({ ...initAccType, groupId: groupId ? +groupId : 0});
		}
		setSelectedId(0)
	}

	async function updateAccType(oldId: number, p: iAccType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/acc-type/${p.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				accs.update(oldId, p)
				setSelectedId(-1)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function insertAccType(p: iAccType) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)		

		await axios
			.post(`/acc-type`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				accs.insert(p)
				accs.remove(0)
				setSelectedId(-1)
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteAccType(id: number) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/acc-type/${id}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				accs.remove(id)
				setSelectedId(-1)
			})
			.catch(error => {
				console.log(error)
			})
	}


}

export default AccType;