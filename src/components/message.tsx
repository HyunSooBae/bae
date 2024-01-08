import styled from 'styled-components';
import { IMsg } from './timeline';
import { auth, db, storage } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useId, useRef, useState } from 'react';

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 3fr auto;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`

const Column = styled.div`
  position: relative;
  min-width: 50px;
`

const Username = styled.p`
  font-weight: 600;
  font-size: 15px;
`

const Status = styled.span`
  margin-left: 4px;
  font-weight: 400;
  font-size: 13px;
  color: gray;
`

const Payload = styled.textarea`
  margin: 10px 0;
  width: 100%;
  height: fit-content;
  border: none;
  font-size: 18px;
  background-color: transparent;
  color: white;
  resize: none;
`

const Photo = styled.img`
  max-width: 100px;
  max-height: 100px;
  /* border-radius: 15px; */
`

const DeleteButton = styled.button`
  margin-right: 10px;
  padding: 5px 10px;
  border: 0;
  border-radius: 5px;
  background-color: tomato;
  font-weight: 600;
  font-size: 12px;
  color: white;
  text-transform: uppercase;
  cursor: pointer;
`

const EditButton = styled.button`
  padding: 5px 10px;
  border: 0;
  border-radius: 5px;
  background-color: #1d9bf0;
  font-weight: 600;
  font-size: 12px;
  color: white;
  text-transform: uppercase;
  cursor: pointer;
`

const PhotoDeleteButton = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px;
  border: 1px solid #1d9bf0;
  border-radius: 50%;
  background-color: white;
  color: #1d9bf0;
  cursor: pointer;
  svg {
    height: 20px;
    vertical-align: middle;
  }
`

const PhotoUploadButton = styled.label`
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(0%, -50%);
  padding: 10px;
  border: 1px solid #1d9bf0;
  border-radius: 8px;
  color: #1d9bf0;
  cursor: pointer;
  svg {
    height: 20px;
    vertical-align: middle;
  }
`
 
const AttachFileInput = styled.input`
  display: none;
`

export default function Message({id, username, photo, msg, userId}: IMsg) {
  const previewId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl ] = useState(photo)
  // console.log('photo:', photo)
  // console.log('imgUrl:', imgUrl)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState("")
  const textRef = useRef<HTMLTextAreaElement>(null)
  const handleTextareaHeight = () => {
    if(textRef.current) {
      // textRef.current.style.height = "auto"
      textRef.current.style.height = textRef.current.clientHeight + "px"
      textRef.current.style.height = textRef.current.scrollHeight + "px"
    }
  }
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const editedText = e.target.value
    setText(editedText)
  }
  const user = auth.currentUser
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this message?")
    if(!ok || user?.uid !== userId) return
    try {
      // 로딩 표시 ?
      await deleteDoc(doc(db, "messages", id))
      if(photo) {
        const photoRef = ref(storage, `messages/${user.uid}/${id}`)
        await deleteObject(photoRef)
      }
    } catch(error) {
      console.log(error)
    } finally {
      // 로딩 종료
    }
  }
  const onEdit = async () => {
    try {
      if(!editing) {
        setEditing(true)
        if(textRef.current){
          textRef.current.disabled = false
          textRef.current.focus()
        }
      } else {
        setEditing(false)
        if(textRef.current){
          textRef.current.disabled = true
        }
        let url = ""
        if(file){
          const locationRef = ref(storage, `messages/${userId}/${id}`)
          const result = await uploadBytes(locationRef, file)
          url = await getDownloadURL(result.ref)
        }
        await updateDoc(doc(db, "messages", id), {
          msg: text,
          photo: url
        })
      }
    } catch(error) {
      console.log(error)
    } finally {
      //
    }
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
  useEffect(() => {
    setText(msg)
    setImgUrl(photo)
    handleTextareaHeight()
  }, [msg, photo])
  return (
    <Wrapper>
      <Column>
        <Username>{username}{editing && <Status>(editing)</Status>}</Username>
        <Payload disabled ref={textRef} onInput={handleTextareaHeight} maxLength={180} onChange={onChange} value={text}></Payload>
        {user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
        {user?.uid === userId ? <EditButton onClick={onEdit}>{editing ? "Save" : "Edit"}</EditButton> : null}
      </Column>

      {imgUrl? ( 
        <Column> 
          <Photo src={imgUrl} /> 
          {editing? (
            <PhotoDeleteButton onClick={onDelClick}>
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </PhotoDeleteButton>
          ) : null}
          
        </Column> 
      ) : null}
      {!imgUrl ? (
        <Column>
          <Photo src={imgUrl} /> 
          {editing? (
            <PhotoUploadButton onClick={onDelClick} htmlFor={`${previewId}-file`}>
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
              </svg>
            </PhotoUploadButton>
          ) : null}
          
          <AttachFileInput onChange={onFileChange} type="file" id={`${previewId}-file`} accept="image/*" />
        </Column>
      ) : null}
    </Wrapper>
  )
}