import React from "react";
import { Outlet,} from "react-router-dom";
import { Link as RouteLink } from "react-router-dom";
import { View } from "@react-spectrum/view";
import { Link } from "@react-spectrum/link";
import { Flex } from "@react-spectrum/layout";

const LentPage = () => {

	return (
		<View>
			<View><span className="div-h1">Pinjaman Unit</span></View>
			<Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
				<Link isQuiet variant="primary"><RouteLink to={'/lent/0'}>Buat Pinjaman Unit Baru</RouteLink></Link>
				<Link isQuiet variant="primary"><RouteLink to={'/lent/list'}>Daftar Pinjaman Unit</RouteLink></Link>
			</Flex>
			<Outlet />
		</View>
	);
}

export default LentPage;