import { Box, Button, Stack } from '@chakra-ui/react'
import React, { MutableRefObject, useEffect, useState } from 'react'
import { MdCheck } from 'react-icons/md'

type Props = {
  canvasRef: MutableRefObject<HTMLCanvasElement>
  canDraw: boolean
}

export function Draw({ canvasRef, canDraw }: Props) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('black')

  const prepareCanvas = () => {
    const canvas = canvasRef.current
    canvas.width = 640
    canvas.height = 480
    canvas.style.width = `${640}px`
    canvas.style.height = `${480}px`

    const context = canvas.getContext('2d')
    context.scale(1, 1)
    context.fillStyle = 'white'
    context.fillRect(0, 0, 640, 480)
    context.strokeStyle = currentColor
    context.lineWidth = 5
  }

  const startDrawing = ({ nativeEvent }) => {
    if (!canDraw) {
      return
    }

    const { offsetX, offsetY } = nativeEvent

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.beginPath()
    context.moveTo(offsetX, offsetY)

    setIsDrawing(true)
  }

  const finishDrawing = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.closePath()

    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !canDraw) {
      return
    }

    const { offsetX, offsetY } = nativeEvent

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.strokeStyle = currentColor
    context.lineTo(offsetX, offsetY)
    context.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current

    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    prepareCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing="4">
      <Box flex="1">
        <Box
          as="canvas"
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          // @ts-ignore
          ref={canvasRef}
          marginX="auto"
        />
      </Box>
      {canDraw && (
        <Stack spacing="4" direction="row" justifyContent="space-between">
          <Stack spacing="4" direction="row">
            {['black', 'green', 'blue', 'red', 'orange', 'yellow'].map(
              (color) => (
                <Button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color)
                  }}
                  leftIcon={color === currentColor ? <MdCheck /> : null}
                >
                  {color}
                </Button>
              )
            )}
          </Stack>
          <Box>
            <Button onClick={clearCanvas}>Clear</Button>
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
