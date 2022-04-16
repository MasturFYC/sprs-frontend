import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAccountSpecific } from 'lib/interfaces';


// penggunaan useEffect referrences
// https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component

export function useAccountCash() {
	const [list, setList] = useState<iAccountSpecific[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			const res = await axios
				.get("/acc-code/spec/1", { headers: headers })
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
		isLoading: isLoading,
		getItem: (id: number) => list.filter(f => f.id === id)[0]
	};

}
