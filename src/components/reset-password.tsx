// import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"
import { useState } from 'react'
import { Form, Input, Title, Wrapper } from '../components/auth-components'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target: {name, value} } = e
    if(name === "email") {
      setEmail(value)
    }
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, email)
      navigate("/")
    } catch(error) {
      console.error(error)
      console.log(error)
    }
  }

  return (
    <Wrapper>
      <Title>reset password page</Title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="email" value={email} placeholder="이메일" type="email" required />
        <Input type="submit" value="비밀번호 초기화 메일 전송" />
      </Form>

    </Wrapper>
  )
}