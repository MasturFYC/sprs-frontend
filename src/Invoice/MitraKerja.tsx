import React from "react";
import { Flex, View } from "@adobe/react-spectrum";
import { iFinance } from "../lib/interfaces";

type ShowFinanceProps = {
	finance: iFinance;
};
export function MitraKerja({ finance }: ShowFinanceProps) {
	return (<View flex>
		{/* <Flex flex direction={'column'} rowGap={'size-50'} alignSelf='self-start'>
			<View flex>
				<strong>PT. SARANA PADMA RIDHO SEPUH</strong>
			</View>
			<View flex>
				Jl. Gator Subroto Villa Gatsu No. 01 - Indramayu
			</View>
		</Flex> */}
		{/* <View marginTop={'size-100'} marginBottom={'size-100'}>Mitra kerja:</View> */}
		<Flex flex direction={'column'} rowGap={'size-50'} alignSelf='self-start'>
			<View flex>
				<strong>{finance.name} - ({finance.shortName})</strong>
			</View>
			<View flex>
				<div>{finance?.street}{finance.city ? `, ${finance.city}` : ''}
					{finance.zip ? ` - ${finance.zip}` : ''}
				</div>
				<div>{finance.phone ? `Telp. ${finance.phone}` : ''}
					{finance.cell && finance.phone ? ` / ` : ''}
					{finance.cell && finance.phone === '' ? `Cellular: ` : ''}
					{finance.cell ?? ''}
				</div>
				<div>{finance.email ? `e-mail: ${finance.email}` : ''}</div>

			</View>
		</Flex>
	</View>
	);
}
