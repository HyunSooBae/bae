import styled from 'styled-components';
import { IMsg } from './timeline';
import { auth, db, storage } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 3fr auto;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`

const Column = styled.div``

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
  border-radius: 15px;
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

export default function Message({id, username, photo, msg, userId}: IMsg) {
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
        await updateDoc(doc(db, "messages", id), {
          msg: text,
        })
      }
    } catch(error) {
      console.log(error)
    } finally {
      //
    }
  }
  useEffect(() => {
    setText(msg)
    handleTextareaHeight()
  }, [msg])
  return (
    <Wrapper>
      <Column>
        <Username>{username}{editing && <Status>(editing)</Status>}</Username>
        <Payload disabled ref={textRef} onInput={handleTextareaHeight} maxLength={180} onChange={onChange} value={text}></Payload>
        {user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
        {user?.uid === userId ? <EditButton onClick={onEdit}>{editing ? "Save" : "Edit"}</EditButton> : null}
      </Column>
      {photo? ( <Column> <Photo src={photo} /> </Column> ) : null}
    </Wrapper>
  )
}