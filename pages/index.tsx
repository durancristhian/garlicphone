import { Box, Divider, Heading, Stack } from '@chakra-ui/react'
import { ColourBox } from 'components/ColourBox'
import { Page } from 'components/Page'
import { CreateRoomForm } from 'flows/home/CreateRoomForm'
import { HowToPlay } from 'flows/home/HowToPlay'
import React from 'react'

function Home() {
  return (
    <Page title="Welcome to Garlic phone">
      <Stack spacing="8" direction="row">
        <Box flex="1">
          <Stack spacing="4">
            <Heading fontSize="xl">Create a room</Heading>
            <CreateRoomForm />
          </Stack>
        </Box>
        <Box width="80">
          <ColourBox>
            <Stack spacing="4">
              <Heading fontSize="xl" textAlign="center">
                How to play
              </Heading>
              <Divider />
              <HowToPlay />
            </Stack>
          </ColourBox>
        </Box>
      </Stack>
    </Page>
  )
}

export default Home
