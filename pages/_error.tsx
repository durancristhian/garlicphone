import { Alert, AlertIcon, AlertTitle } from '@chakra-ui/react'
import React from 'react'

function Error() {
  return (
    <Alert status="error" variant="solid">
      <AlertIcon />
      <AlertTitle>An error occurred</AlertTitle>
    </Alert>
  )
}

export default Error
