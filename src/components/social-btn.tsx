import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import styled from 'styled-components'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export interface IProps {
  site: string;
}

const Button = styled.span`
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
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

export default function SocialButton({site}: IProps){
  const navigate = useNavigate()
  const onClick = async () => {
    try {
      let provider = null
      if(site == "Google") provider = new GoogleAuthProvider()
      if(site == "Github") provider = new GithubAuthProvider()
      // await signInWithRedirect(auth, provider)
      if(!provider) return
      await signInWithPopup(auth, provider)
      navigate("/")
    } catch(error) {
      console.error(error)
    }
  }
  return (
  <Button onClick={onClick}>
    <Logo src={`public/${site}-logo.svg`} />
    Continue with {site}
  </Button>
  )
}