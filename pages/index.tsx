import { Heading, Stack } from '@chakra-ui/react'
import { CreateRoomForm } from 'flows/home/CreateRoomForm'
import React from 'react'

function Home() {
  return (
    <Stack spacing="8">
      <Heading>gartic-phone</Heading>
      <CreateRoomForm />
    </Stack>
  )
}

export default Home
