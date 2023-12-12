import styled from 'styled-components'
import { auth, db, storage } from '../firebase'
import { useEffect, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { IMsg } from '../components/timeline'
import Message from '../components/message'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`

const AvatarUpload = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bF0;
  cursor: pointer;
  svg {
    width: 50px;
  }
`

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
const AvatarInput = styled.input`
  display: none;
`
const Name = styled.span`
  font-size: 22px;
`

const Msgs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  overflow-y: auto;
`

export default function Profile(){
  const user = auth.currentUser
  const [avatar, setAvatar] = useState(user?.photoURL)
  const [msgs, setMsgs] = useState<IMsg[]>([])
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target
    if(!user) return
    if(files && files.length === 1){
      const file = files[0]
      const locationRef = ref(storage, `avatars/${user?.uid}`)
      const result = await uploadBytes(locationRef, file)
      const avatarUrl = await getDownloadURL(result.ref)
      setAvatar(avatarUrl)
      await updateProfile(user, {
        photoURL: avatarUrl,
      })
    }
  }  
  const fetchMsgs = async () => {
    console.log(user?.uid)
    const msgQuery = query(
      collection(db, "messages"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    )
    const snapshot = await getDocs(msgQuery)
    const msgs = snapshot.docs.map((doc) => {
      const { msg, createdAt, userId, username, photo } = doc.data()
      return {
        msg, createdAt, userId, username, photo, id: doc.id,
      }
    })
    setMsgs(msgs)
    console.log(msgs)
  }
  useEffect(() => {
    fetchMsgs()
  }, [])
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        { avatar ? (
        <AvatarImg src={avatar} />
        ) : (
        <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>) }
      </AvatarUpload>
      <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
      <Name>
        {user?.displayName ?? "Anonymous"}
      </Name>
      <Msgs>
        {msgs.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
      </Msgs>
    </Wrapper>
  )
}