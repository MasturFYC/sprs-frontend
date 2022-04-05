import React /* , /* { useState } */ from "react";
import { Outlet } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Link } from "@react-spectrum/link";
import { Link as RouteLink } from "react-router-dom";
import { Flex } from "@adobe/react-spectrum";

const LoanPage = () => {

	return (
		<View>
			<View><span className="div-h1">Piutang</span></View>
			<Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
				<Link isQuiet variant="primary"><RouteLink to={'/loan/0'}>Buat Piutang Baru</RouteLink></Link>
				<Link isQuiet variant="primary"><RouteLink to={'/loan/list'}>Daftar Piutang</RouteLink></Link>
			</Flex>
			<Outlet />
		</View>
	);
}

export default LoanPage;