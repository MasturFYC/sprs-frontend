
export const PrettyPrintJson = ({ data }: any) => {
	// (destructured) data could be a prop for example
	return (<div style={{fontSize: 'small'}}><pre>{JSON.stringify(data, null, 2)}</pre></div>);
}
