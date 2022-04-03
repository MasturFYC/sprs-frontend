import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAccountSpecific } from 'lib/interfaces';

export function useAccountCash() {
	const [list, setList] = useState<iAccountSpecific[]>([]);
//	const [item, setItem] = useState(0);

	const getItem = (id:number) => {
		const test = list.filter(f=>f.id === id)[0]
		return test;
	}
	
	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			await axios
				.get("/acc-code/spec/1", { headers: headers })
				.then(response => response.data)
				.catch(error => console.log(error))
				.then(data => setList(data));
		}

		if (!isLoaded) {
			load();
		}

		return () => { isLoaded = true; };
	}, []);

	return {
		items: list,
		getItem: (id: number) => getItem(id)
	};

}
