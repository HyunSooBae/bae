import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import styled from 'styled-components';
import { db } from '../firebase';
import Message from './message';
import { Unsubscribe } from 'firebase/auth';

export interface IMsg {
  id: string;
  photo?: string;
  msg: string;
  userId: string;
  username: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
`

export default function Timeline() {
  const [msgs, setMsgs] = useState<IMsg[]>([])
  useEffect(() => {
    let unsubscribe : Unsubscribe | null = null
    const fetchMsgs = async () => {
      const msgsQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        limit(10)
      )
      // const snapshot = await getDocs(msgsQuery)
      // const msgs = snapshot.docs.map(doc => {
      //   const { msg, createdAt, userId, username, photo } = doc.data()
      //   return {
      //     id: doc.id,
      //     msg,
      //     createdAt,
      //     userId,
      //     username,
      //     photo
      //   }
      // })
      unsubscribe = await onSnapshot(msgsQuery, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const { msg, createdAt, userId, username, photo } = doc.data()
          return {
            id: doc.id,
            msg,
            createdAt,
            userId,
            username,
            photo
          }
        })
        setMsgs(msgs)
      })
    }
    fetchMsgs()
    return () => { // cleanup function
      unsubscribe && unsubscribe()
    }
  }, [])
  return (
    <Wrapper>
      {msgs.map((msg) => (
        <Message key={msg.id} {...msg} />
      ))}
    </Wrapper>
  )
}