import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import React, { useState } from 'react'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { Error, Form, Input, Switcher, Title, Wrapper } from '../components/auth-components'
import SocialButton from '../components/social-btn'

export default function CreateAccount() {
  const navigate = useNavigate()
  const [ isLoading, setIsLoading ] = useState(false)
  const [ name, setName ] = useState("")
  const [ email, setEmail ] = useState("")
  const [ password, setPassword ] = useState("")
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target: {name, value} } = e
    if(name === "name"){
      setName(value)
    } else if(name === "email") {
      setEmail(value)
    } else if(name === "password") {
      setPassword(value)
    }
  }
  const [ error, setError ] = useState("")
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if(isLoading || name === "" || email === "" || password === "") return
    try{
      setIsLoading(true)
      console.log(name, email, password)
      const credentials = await createUserWithEmailAndPassword(auth, email, password)
      console.log(credentials.user)
      await updateProfile(credentials.user, {
        displayName: name
      })
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
      <Title>Join Bae!</Title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="name" value={name} placeholder="이름" type="text" required />
        <Input onChange={onChange} name="email" value={email} placeholder="이메일" type="email" required />
        <Input onChange={onChange} name="password" value={password} placeholder="비밀번호" type="password" required />
        <Input type="submit" value={isLoading ? "loading..." : "가입하기"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        이미 계정이 있으세요? <Link to="/login">로그인하기 &rarr;</Link>
      </Switcher>
      <SocialButton site="Google" />
      <SocialButton site="Github" />
    </Wrapper>
  )
}