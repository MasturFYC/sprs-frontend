import { iTrx, iAccCodeType } from "./interfaces";

// const numberFormat = new Intl.NumberFormat("id-ID", {
// 	useGrouping: true,
// 	minimumFractionDigits: 0,
// 	maximumFractionDigits: 2
// });

const dateFormat = (month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined) => new Intl.DateTimeFormat("id-ID", {
	year: 'numeric',
	month: month,
	day: "2-digit"
});

export const FormatDate = (e: string, options: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined = 'short') => {
	return dateFormat(options).format(new Date(e));
}

export const FormatNumber = (e: number, minimumFractionDigits = 0, useGrouping = true, maximumFractionDigits = 2) => {
	return new Intl.NumberFormat("id-ID", {
		useGrouping: useGrouping,
		minimumFractionDigits: minimumFractionDigits,
		maximumFractionDigits: maximumFractionDigits
	}).format(e);
}


export function createToken(p: iTrx, accs: iAccCodeType[], ids: number[]): string {
	const s: string[] = [];

	s.push(p.descriptions);
	s.push(p.division);

	for (let c = 0; c < ids.length; c++) {
		const d = ids[c];
		const acc = accs.filter(o => o.id === d)[0]
		if (acc) {
			s.push(acc.name)
			s.push(acc.typeName)
		}
	}

	if (p.id > 0) {
		s.push('/id-' + p.id)
	}

	if (p.refId > 0) {
		s.push('/ref-' + p.refId)
	}

	if (p.memo && p.memo.length > 0) {
		s.push(p.memo);
	}

	return s.join(" ");
}
