import { addDoc, collection, updateDoc } from 'firebase/firestore'
import { useState } from 'react'
import styled from 'styled-components'
import { auth, db, storage } from '../firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const TextArea = styled.textarea`
  padding: 20px;
  width: 100%;
  border: 2px solid white;
  border-radius: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  background-color: black;
  color: white;
  resize: none;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`

const AttachFileButton = styled.label`
  padding: 10px 0px;
  border: 1px solid #1d9bf0;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #1d9bf0;
  cursor: pointer;
`
 
const AttachFileInput = styled.input`
  display: none;
`

const SubmitBtn = styled.input`
  padding: 10px 0px;
  border: none;
  border-radius: 20px;
  background-color: #1d9bf0;
  font-size: 16px;
  color: white;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9
  }
`

export default function PostMsgForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl ] = useState("")
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMsg(e.target.value)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if(files){
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onloadend = () => {
        setImgUrl(reader.result)
      }
    }
    if(files && files.length >= 1) {
      setFile(files[0])

    }
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const user = auth.currentUser
    if(!user || isLoading || msg === "" || msg.length > 180) return
    try {
      setIsLoading(true)
      const doc = await addDoc(collection(db, "messages"), {
        msg,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid
      })
      if(file) {
        const locationRef = ref(storage, `messages/${user.uid}-${user.displayName}/${doc.id}`)
        const result = await uploadBytes(locationRef, file)
        const url = await getDownloadURL(result.ref)
        await updateDoc(doc, {
          photo: url,
        })
      }
      setMsg("")
      setFile(null)
      setImgUrl("")
    } catch(error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <TextArea onChange={onChange} value={msg} placeholder="Your Plan?" rows={5} maxLength={180} required />
      <img src={imgUrl ? imgUrl : ""} />
      <AttachFileButton htmlFor="file">{file? "Photo added ✅" : "Add photo"}</AttachFileButton>
      <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
      <SubmitBtn type="submit" value={isLoading? "Posting..." : "Post Message"} />
    </Form>
  )
}