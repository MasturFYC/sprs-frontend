import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAccountSpecific } from 'lib/interfaces';

export function useAccountCash() {
	const [list, setList] = useState<iAccountSpecific[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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
				.then(data => {
					setList(data);
					setIsLoading(false);
				});
		}

		if (!isLoaded) {
			setIsLoading(true)
			load();
		}

		return () => { isLoaded = true; };
	}, []);

	return {
		items: list,
		isLoading: isLoading,
		getItem: (id: number) => list.filter(f => f.id === id)[0]
	};

}
