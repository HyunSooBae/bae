import { addDoc, collection, updateDoc } from 'firebase/firestore'
import { useState } from 'react'
import styled from 'styled-components'
import { auth, db, storage } from '../firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0px;
  z-index: 1000;
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

const PreviewPhoto = styled.div`
  position: relative;
  width: fit-content;
  max-height: 150px;
  text-align: center;
`

const Photo = styled.img`
  height: 100%;
`

const PhotoDeleteButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border: 1px solid #1d9bf0;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #1d9bf0;
  cursor: pointer;
  svg {
    display: block;
    /* width: 100%;
    height: 100%; */
  }
`

const AttachFileButton = styled.label`
  padding: 10px 0px;
  width: 100%;
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
  width: 100%;
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
  const onMsgChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMsg(e.target.value)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if(files && files.length >= 1) {
      setFile(files[0])
    }
    if(files){
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onloadend = () => {
        setImgUrl(String(reader.result))
        e.target.value = ""
      }
    }
  }
  const onDelClick = () => {
    setFile(null)
    setImgUrl("")
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
        const locationRef = ref(storage, `messages/${user.uid}/${doc.id}`)
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
      <TextArea onChange={onMsgChange} value={msg} placeholder="Your Plan?" rows={5} maxLength={180} required />
      <PreviewPhoto>
        <Photo src={imgUrl ? imgUrl : ""} />
        {imgUrl && 
        <PhotoDeleteButton onClick={onDelClick} type="button">
          <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </PhotoDeleteButton>}
      </PreviewPhoto>
      <AttachFileButton htmlFor="file">{file? "Photo added ✅" : "Add photo"}</AttachFileButton>
      <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
      <SubmitBtn type="submit" value={isLoading? "Posting..." : "Post Message"} />
    </Form>
  )
}