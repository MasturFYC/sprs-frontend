import { Flex, ProgressCircle } from "@adobe/react-spectrum"

const WaitMe = () => {
	return <Flex flex justifyContent={'center'}><ProgressCircle size={'M'} aria-label="Loading…" isIndeterminate /></Flex>
}

export default WaitMe;