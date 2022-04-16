//import React from "react";
import { View } from "@adobe/react-spectrum";
import { iAccountSpecific } from "../lib/interfaces";

type showCashProps = {
	account: iAccountSpecific;
};
export function ShowCash({ account }: showCashProps) {
	return (
		<View marginStart={'calc(100px + size-75 + 2px)'}>
			<View>{account.name}</View>
			<View>{account.descriptions ?? '-'}</View>
		</View>
	);
}
