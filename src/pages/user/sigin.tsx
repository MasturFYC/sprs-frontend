import React, { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { View } from '@react-spectrum/view'
import { Form } from '@react-spectrum/form'
import { Flex } from '@react-spectrum/layout'
import { TextField } from '@react-spectrum/textfield'
import { ButtonGroup } from '@react-spectrum/buttongroup'
import { Button } from '@react-spectrum/button'
import useAuthService from 'lib/auth-service'

function SignInForm() {
  const navigate = useNavigate();
  const [username, setUserName] = React.useState("")
  // const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [message, setMessage] = React.useState("")
  const auth = useAuthService();

  const isNameValid = React.useMemo(
    () => username.length >= 5,
    [username]
  )
  const isPassowrdValid = React.useMemo(
    () => password.length >= 8,
    [password]
  )
  // const isEmailValid = React.useMemo(
  //   // eslint-disable-next-line no-useless-escape
  //   () => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
  //     email
  //   ),
  //   [email]
  // )

  return (
    <View maxWidth={'size-3600'} alignSelf='center' justifySelf='center'>
      <Form onSubmit={handleLogin}>
        <View marginBottom={'size-200'}><span className={'div-h2'}>Signin</span></View>
        <Flex direction={'column'} rowGap={'size-400'}>
          <TextField
            label="Username"
            validationState={isNameValid ? "valid" : "invalid"}
            maxLength={50}
            value={username}
            onChange={(e) => setUserName(e)}
          />
          {/* <TextField
            label="email"
            validationState={isEmailValid ? "valid" : "invalid"}
            maxLength={128}
            value={email}
            onChange={(e) => setEmail(e)}
          /> */}
          <TextField
            type={'password'}
            label="Password"
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
            >Signin</Button>
          <Button variant={'primary'}
            onPress={() => navigate("/")}
          >Cancel</Button>
        </ButtonGroup>
      </Flex>
    </Form>
    </View >
  );


  function handleLogin(e: FormEvent) {
    e.preventDefault();
    auth.login(username,password).then(data => {
      navigate("/profile")
    }).catch(error => {
      setMessage(error.message)
    });
  }
}


export default SignInForm;