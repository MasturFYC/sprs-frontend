import { Flex } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { Link } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import UserMain from "./user-main";

const UserLayout = () => {
	return <Router>
		<View flex backgroundColor={'transparent'}>
			<div style={{
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed',
				backgroundPosition: 'top left',
				backgroundSize: 'cover',
				backgroundImage: `url(${process.env.REACT_APP_API_URL}/common/file/login-back.jpg)`}}>
			<Flex direction={'column'} alignContent='center' rowGap={'size-100'} minHeight={"100vh"}>
				
				<View marginTop={'size-200'} alignSelf={'center'}>
					<Link isQuiet variant="primary">
						<RouterLink to='/auth/login'>Login</RouterLink>
					</Link>
				</View>

				<UserMain />

			</Flex>
			</div>
		</View>
	</Router>
}

export default UserLayout;