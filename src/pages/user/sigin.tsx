import React, { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { View } from '@react-spectrum/view'
import { Form } from '@react-spectrum/form'
import { Flex } from '@react-spectrum/layout'
import { TextField } from '@react-spectrum/textfield'
import { ButtonGroup } from '@react-spectrum/buttongroup'
import { Button } from '@react-spectrum/button'
import useAuthService from 'lib/auth-service'
import { Link } from 'react-router-dom'

function SignInForm() {
  const navigate = useNavigate();
  const [username, setUserName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [message, setMessage] = React.useState("")
  const auth = useAuthService();

  const isNameValid = React.useMemo(
    () => username.length >= 3,
    [username]
  )

  return (
    <View
    width={{base:'auto', L: 'size-3600'}}
    padding={{base:'size-100', L:'size-200'}}
    backgroundColor={'gray-75'}
    borderRadius={'large'}
    borderColor={'gray-100'}
    borderWidth={'thick'}
    alignSelf={{base: 'center', L: 'end'}}
    justifySelf='center'
    marginY={{base: 'size-100', L: 'size-400'}}
    marginEnd={{base: 'size-0', L: 'size-400'}}
    >
      <View marginBottom={'size-200'}><span className={'div-h1'}>Login</span></View>
      <Form onSubmit={handleLogin}>
        <Flex direction={'column'} rowGap={'size-400'}>
          <TextField
            label="Username"
            autoFocus
            width={'auto'}
            validationState={isNameValid ? "valid" : "invalid"}
            maxLength={50}
            value={username}
            placeholder={'e.g. username'}
            onChange={(e) => setUserName(e)}
          />
          <TextField
            type={'password'}
            width={'auto'}
            autoComplete={'current-password'}
            label="Password"
            maxLength={50}
            value={password}
            onChange={(e) => setPassword(e)}
          />
          <View>
            {message}
          </View>
          <ButtonGroup>
            <Button type='submit' variant={'cta'}
              isDisabled={!(isNameValid)}              
            >Signin</Button>
          <Button variant={'primary'}
            onPress={() => navigate("/")}
          >Cancel</Button>
        </ButtonGroup>
        <View>
          Belum punya akun? Silahkan <Link to='/auth/register'>Register</Link>.
        </View>
      </Flex>
    </Form>
    </View >
  );


  function handleLogin(e: FormEvent) {
    e.preventDefault();
    auth.login(username,password).then(data => {
      navigate("/")
      window.location.reload();
    }).catch(error => {
      setMessage(error.message)
    });
  }
}


export default SignInForm;