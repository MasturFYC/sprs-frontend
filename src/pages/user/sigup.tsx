import React, { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { View } from '@react-spectrum/view'
import { Form } from '@react-spectrum/form'
import { Flex } from '@react-spectrum/layout'
import { TextField } from '@react-spectrum/textfield'
import { ButtonGroup } from '@react-spectrum/buttongroup'
import { Button } from '@react-spectrum/button'
import useAuthService from 'lib/auth-service'

function SignUpForm() {
  const navigate = useNavigate();
  const [username, setUserName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [message, setMessage] = React.useState("")
  const auth = useAuthService();

  const isNameValid = React.useMemo(
    () => username.length >= 3,
    [username]
  )
  const isPassowrdValid = React.useMemo(
    () => password.length >= 8,
    [password]
  )
  const isEmailValid = React.useMemo(
    // eslint-disable-next-line no-useless-escape
    () => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    ),
    [email]
  )

  return (
    <View
      width={{ base: 'auto', L: 'size-3600' }}
      padding={{ base: 'size-100', L: 'size-200' }}
      backgroundColor={'indigo-700'}
      borderRadius={'large'}
      borderColor={'gray-100'}
      borderWidth={'thick'}
      alignSelf={{ base: 'center', L: 'end' }}
      justifySelf='center'
      marginY={{ base: 'size-100', L: 'size-400' }}
      marginEnd={{ base: 'size-0', L: 'size-400' }}
    >
      <View marginBottom={'size-200'}><span className={'div-h1 text-white'}>Register</span></View>
      <Form onSubmit={handleLogin}>
        <Flex direction={'column'} rowGap={'size-400'}>
          <TextField
            label={<div className='text-white' >Username</div>}
            autoFocus
            width={'auto'}
            validationState={isNameValid ? "valid" : "invalid"}
            maxLength={50}
            value={username}
            placeholder={'e.g. username'}
            onChange={(e) => setUserName(e)}
          />
          <TextField
            label={<div className='text-white' >E-mail</div>}
            width={'auto'}
            validationState={isEmailValid ? "valid" : "invalid"}
            maxLength={128}
            value={email}
            placeholder={'e.g. username@fyc.com'}
            onChange={(e) => setEmail(e)}
          />
          <TextField
            type={'password'}
            label={<div className='text-white'>Password</div>}
            width={'auto'}
            validationState={isPassowrdValid ? "valid" : "invalid"}
            maxLength={50}
            value={password}
            onChange={(e) => setPassword(e)}
          />
          <View>
            {message}
          </View>
          <ButtonGroup>
            <Button type='submit' variant={'cta'}
              isDisabled={!(isNameValid && isPassowrdValid)}
            >Register now</Button>
            <Button variant={'overBackground'}
              onPress={() => navigate("/")}
            >Cancel</Button>
          </ButtonGroup>
        </Flex>
      </Form>
    </View >
  );


  function handleLogin(e: FormEvent) {
    e.preventDefault();
    auth.register(username, email, password).then(data => {
      navigate("/profile")
    }).catch(error => {
      setMessage(error.message)
    });
  }
}


export default SignUpForm;