import { signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { Error, Form, Input, Switcher, Title, Wrapper } from '../components/auth-components'
import GithubButton from '../components/github-btn'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [ isLoading, setIsLoading ] = useState(false)
  const [ email, setEmail ] = useState("")
  const [ password, setPassword ] = useState("")
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target: {name, value} } = e
    if(name === "email") {
      setEmail(value)
    } else if(name === "password") {
      setPassword(value)
    }
  }
  const [ error, setError ] = useState("")
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if(isLoading || email === "" || password === "") return
    try{
      setIsLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
      // 계정 생성
      // 사용자 프로필 이름 생성
      // 메인으로 리다이렉트
    } catch(e) {
      // error 처리
      if(e instanceof FirebaseError){
        console.log(e.code, e.message)
        setError(e.message)
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Wrapper>
      <Title>Log into Bae!</Title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="email" value={email} placeholder="이메일" type="email" required />
        <Input onChange={onChange} name="password" value={password} placeholder="비밀번호" type="password" required />
        <Input type="submit" value={isLoading ? "loading..." : "로그인"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Link to="/reset-password">비밀번호를 잊어버렸어요</Link>
      <Switcher>
        계정이 없으세요? <Link to="/create-account">회원가입하기 &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  )
}