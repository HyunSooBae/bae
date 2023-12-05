import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import styled from 'styled-components'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

const Button = styled.span`
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  padding: 10px 20px;
  width: 100%;
  border-radius: 50px;
  border: 0;
  background-color: white;
  font-weight: 500;
  color: black;
  cursor: pointer;
`

const Logo = styled.img`
  height: 25px;
`

export default function GithubButton(){
  const navigate = useNavigate()
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider()
      // await signInWithRedirect(auth, provider)
      await signInWithPopup(auth, provider)
      navigate("/")
    } catch(error) {
      console.error(error)
    }
  }
  return (
  <Button onClick={onClick}>
    <Logo src="public/github-logo.svg" />
    Continue with Github
  </Button>
  )
}