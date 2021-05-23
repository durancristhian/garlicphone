import { Button, FormControl, FormLabel, Select, Stack } from '@chakra-ui/react'
import { AlertMessage } from 'components/AlertMessage'
import { CopyInviteLink } from 'components/CopyInviteLink'
import { usePlayer } from 'contexts/Player'
import { usePlayers } from 'contexts/Players'
import { useRoom } from 'contexts/Room'
import { useToasts } from 'hooks/useToasts'
import React, { ChangeEvent, useState } from 'react'
import { ACTIVITY_TYPE } from 'types/Room'
import { initGame } from 'utils/initGame'
import { updateRoom } from 'utils/updateRoom'

export function ConfigureRoom() {
  const room = useRoom()
  const player = usePlayer()
  const players = usePlayers()
  const { showToast, updateToast } = useToasts()
  const [isWorking, setIsWorking] = useState(false)

  const canPlay = players.length >= 2
  const isCurrentPlayerRoomAdmin = room.adminId === player.id
  const admin = players.find((p) => p.id === room.adminId)

  const play = async () => {
    const toastId = showToast({
      description: 'Preparing the room...',
    })

    try {
      setIsWorking(true)

      await initGame({
        roomId: room.id,
        players,
        action: ACTIVITY_TYPE.INIT,
      })

      updateToast(toastId, {
        status: 'success',
        title: 'Yeay!',
        description: 'Room successfully configured',
      })
    } catch (error) {
      console.error(error)

      updateToast(toastId, {
        status: 'error',
        title: 'Ups!',
        description: 'There was an error',
      })
    } finally {
      setIsWorking(false)
    }
  }

  const updateRoomSettings = async (event: ChangeEvent<HTMLSelectElement>) => {
    try {
      setIsWorking(true)

      await updateRoom({
        id: room.id,
        stepTime: Number(event.target.value),
      })
    } catch (error) {
      console.error(error)

      showToast({
        status: 'error',
        title: 'Ups!',
        description: 'There was an error updating the room',
      })
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Stack spacing="4">
      {!isCurrentPlayerRoomAdmin && (
        <AlertMessage
          status="info"
          title="Be prepared"
          description={`Waiting for ${admin.name} to start the game.`}
        />
      )}
      <FormControl id="roundTime" flex="1">
        <FormLabel>Round time</FormLabel>
        <Select
          flex="1"
          variant="filled"
          value={room.stepTime}
          onChange={updateRoomSettings}
          disabled={room.adminId !== player.id}
        >
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
          <option value="120">2 minutes</option>
        </Select>
      </FormControl>
      <Stack
        spacing="4"
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        <CopyInviteLink text={`${window.location.origin}/${room.id}`} />
        <Button
          colorScheme="tertiary"
          onClick={play}
          disabled={!isCurrentPlayerRoomAdmin || !canPlay || isWorking}
          isLoading={isWorking}
          loadingText="Wait..."
        >
          Play
        </Button>
      </Stack>
    </Stack>
  )
}
