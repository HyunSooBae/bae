import styled from 'styled-components';
import { IMsg } from './timeline';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr auto;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`

const Column = styled.div``

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`

const Payload = styled.p`
  margin: 10px 0;
  font-size: 18px;
`

const Photo = styled.img`
  max-width: 100px;
  max-height: 100px;
  border-radius: 15px;
`

export default function Message({username, photo, msg}: IMsg) {
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{msg}</Payload>
      </Column>
      {photo? (
        <Column>
          <Photo src={photo} />
        </Column>
      ) : null}
    </Wrapper>
  )
}