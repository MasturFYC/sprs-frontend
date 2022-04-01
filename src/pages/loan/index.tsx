import React /* , /* { useState } */ from "react";
import { Outlet, 
	//useParams 
} from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Link } from "@react-spectrum/link";
import { Link as RouteLink } from "react-router-dom";
import { Flex } from "@adobe/react-spectrum";
// import { dateParam, iLoan } from "lib/interfaces";
// import axios from 'lib/axios-base';
// import { PrettyPrintJson } from "lib/utils";


// type TrxDetail = {
// 	groupId: number,
// 	id: number,
// 	trxId: number,
// 	codeId: number,
// 	debt: number,
// 	cred: number,
// 	saldo: number
// }

// type Trx = {
// 	id: number,
// 	refId: number,
// 	division: string,
// 	trxDate: string,
// 	descriptions?: string | undefined,
// 	memo?: string | undefined,
// 	detail: TrxDetail
// }

// interface Loan extends iLoan {
// 	trxs: Trx[]
// }
// const initTrx: Trx = {
// 	id: 0,
// 	refId: 0,
// 	division: '',
// 	trxDate: dateParam(null),
// 	detail: {
// 		groupId: 0,
// 		id: 0,
// 		trxId: 0,
// 		codeId: 0,
// 		debt: 0,
// 		cred: 0,
// 		saldo: 0
// 	}
// }

// const initLoan: Loan = {
// 	trxs: [initTrx],
// 	id: 0,
// 	name: '',
// 	persen: 10
// }

const LoanPage = () => {
//	const { pid } = useParams()
//	let navigate = useNavigate()
//	const { pathname } = useLocation();
	// const [loan, setLoan] = useState<Loan>({} as Loan)

	// React.useEffect(() => {
	// 	let isLoaded = false;

	// 	async function load(id: string) {

	// 		const headers = {
	// 			'Content-Type': 'application/json'
	// 		}

	// 		let res = await axios
	// 			.get(`/loans/${id}`, { headers: headers })
	// 			.then(response => response.data)
	// 			.then(data => data)
	// 			.catch(error => {
	// 			})


	// 		return res ? res : initLoan;
	// 	}

	// 	if (!isLoaded) {
	// 		if (pid) {
	// 			load(pid).then(data => {
	// 				setLoan(data);
	// 			})
	// 		} else {
	// 			setLoan({} as Loan)
	// 		}
	// 	}

	// 	return () => { isLoaded = true }

	// }, [pid])

	return (
		<View>
			<View><span className="div-h1">Piutang</span></View>
			<Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
				<Link isQuiet variant="primary"><RouteLink to={'/loan/0'}>Buat Piutang Baru</RouteLink></Link>
				<Link isQuiet variant="primary"><RouteLink to={'/loan/list'}>Daftar Piutang</RouteLink></Link>
				{/* <Button variant="cta" onPress={() => navigate("/loan/0", { state: { from: pathname } })}>Buat Piutang Baru</Button> */}
			</Flex>
			{/* <PrettyPrintJson data={loan} /> */}
			<Outlet />
		</View>
	);
}

export default LoanPage;