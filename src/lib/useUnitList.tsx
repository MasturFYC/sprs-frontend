import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { lentUnit } from "pages/lent/interfaces";

export function useUnitList() {
  const [list, setList] = useState<lentUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

			const res = await axios
        .get("/lent/get/units", { headers: headers })
				.then(response => response.data)
				.catch(error => console.log(error))
				.then(data => data);

			return res ? res : [];
		}
		setIsLoading(true)
		load().then(data => {
			if (!isLoaded) {
				setList(data)
				setIsLoading(false)
			}
		});
		return () => { isLoaded = true; };
	}, []);

	return {
		items: list,
		count: () => list.length,
    isLoading: isLoading,
		getItem: (id: number) => getItem(id)
	};

}
