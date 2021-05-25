import { Box, Button, Icon, SimpleGrid, Stack } from '@chakra-ui/react'
import Color from 'color'
import React, {
  MouseEvent,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { BiEraser } from 'react-icons/bi'
import {
  MdCheck,
  MdDelete,
  MdEdit,
  MdFormatColorFill,
  MdUndo,
} from 'react-icons/md'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from 'utils/constants'

const PALLETE = [
  '#18181B',
  '#ffffff',
  '#666666',
  '#aaaaaa',
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#F97316',
  '#FBBF24',
  '#964112',
  '#7C3AED',
  '#99004e',
  '#ff008f',
  '#FBCFE8',
]

const COLORS = PALLETE.map((color) => {
  return {
    value: color,
    iconColor: Color(color).luminosity() > 0.5 ? 'background.500' : 'white',
  }
})

const SHAPE_SIZES = [{ value: 2 }, { value: 5 }, { value: 10 }]

enum TOOL {
  PENCIL = 'PENCIL',
  ERASER = 'ERASER',
  BUCKET = 'BUCKET',
}

type RGBA_Color = { r: number; g: number; b: number; a: number }

type Props = {
  canvasRef: MutableRefObject<HTMLCanvasElement>
  canDraw: boolean
  doneButton: ReactNode
  setCanvasTouched: (canvasTouched: boolean) => void
}

export function Draw({
  canvasRef,
  canDraw,
  doneButton,
  setCanvasTouched,
}: Props) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState(COLORS[0].value)
  const [colorBeforeEraser, setColorBeforeEraser] = useState('')
  const [currentTool, setCurrentTool] = useState<TOOL>(TOOL.PENCIL)
  const [currentLineWidth, setCurrentLineWidth] = useState(5)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const undoRef = useRef<HTMLButtonElement>(null)

  useHotkeys('ctrl+z, command+z', () => {
    if (undoRef.current) {
      undoRef.current.click()
    }
  })

  useEffect(() => {
    setCanvasTouched(undoStack.length > 1)
  }, [setCanvasTouched, undoStack])

  const handleUndo = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)

    const copyUndoStack = [...undoStack]
    copyUndoStack.pop()

    setUndoStack(copyUndoStack)

    const source = copyUndoStack[copyUndoStack.length - 1]

    const img = new Image()
    img.src = source
    img.onload = () => {
      context.imageSmoothingEnabled = false
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }

  const getCurrentColor = () => {
    return Color.rgb(currentColor).string()
  }

  const prepareCanvas = () => {
    const canvas = canvasRef.current
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    canvas.style.width = `${CANVAS_WIDTH}px`
    canvas.style.height = `${CANVAS_HEIGHT}px`

    const context = canvas.getContext('2d')
    context.scale(1, 1)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    context.strokeStyle = getCurrentColor()
    context.lineWidth = currentLineWidth
    context.lineCap = 'round'

    setUndoStack([canvas.toDataURL()])
  }

  const startDrawing = ({ nativeEvent }) => {
    if (!canDraw) {
      return
    }

    const { offsetX, offsetY } = nativeEvent

    if (currentTool !== TOOL.BUCKET) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (currentTool === TOOL.PENCIL) {
        context.beginPath()
        context.lineWidth = currentLineWidth
        context.strokeStyle = getCurrentColor()
        context.lineTo(offsetX, offsetY)
        context.lineTo(offsetX + 1, offsetY + 1)
        context.stroke()
        context.closePath()
      }

      context.beginPath()
      context.moveTo(offsetX, offsetY)

      setIsDrawing(true)
    } else {
      floodFill(offsetX, offsetY)
    }
  }

  const getPixelPos = function (x: number, y: number, canvasWidth: number) {
    return (y * canvasWidth + x) * 4
  }

  const matchStartColor = function (
    data: unknown,
    pos: number,
    startColor: RGBA_Color
  ) {
    return (
      data[pos] === startColor.r &&
      data[pos + 1] === startColor.g &&
      data[pos + 2] === startColor.b &&
      data[pos + 3] === startColor.a
    )
  }

  const colorPixel = function (data: unknown, pos: number, color: RGBA_Color) {
    data[pos] = color.r || 0
    data[pos + 1] = color.g || 0
    data[pos + 2] = color.b || 0
    data[pos + 3] = color.a || 255
  }

  const floodFill = (offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const dstImg = context.getImageData(0, 0, canvas.width, canvas.height)
    const dstData = dstImg.data

    const startPos = getPixelPos(offsetX, offsetY, canvas.width)
    const startColor = {
      r: dstData[startPos],
      g: dstData[startPos + 1],
      b: dstData[startPos + 2],
      a: dstData[startPos + 3],
    }
    const todo = [[offsetX, offsetY]]
    const fillColor = Color.rgb(currentColor).object()
    const rgba = {
      r: fillColor['r'],
      g: fillColor['g'],
      b: fillColor['b'],
      a: fillColor.alpha,
    }

    while (todo.length) {
      const pos = todo.pop()
      const x = pos[0]
      let y = pos[1]
      let currentPos = getPixelPos(x, y, canvas.width)

      while (y-- >= 0 && matchStartColor(dstData, currentPos, startColor)) {
        currentPos -= canvas.width * 4
      }

      currentPos += canvas.width * 4
      ++y
      let reachLeft = false
      let reachRight = false

      while (
        y++ < canvas.height - 1 &&
        matchStartColor(dstData, currentPos, startColor)
      ) {
        colorPixel(dstData, currentPos, rgba)

        if (x > 0) {
          if (matchStartColor(dstData, currentPos - 4, startColor)) {
            if (!reachLeft) {
              todo.push([x - 1, y])
              reachLeft = true
            }
          } else if (reachLeft) {
            reachLeft = false
          }
        }

        if (x < canvas.width - 1) {
          if (matchStartColor(dstData, currentPos + 4, startColor)) {
            if (!reachRight) {
              todo.push([x + 1, y])
              reachRight = true
            }
          } else if (reachRight) {
            reachRight = false
          }
        }

        currentPos += canvas.width * 4
      }
    }

    context.putImageData(dstImg, 0, 0)

    setUndoStack([...undoStack, canvas.toDataURL()])
  }

  const finishDrawing = () => {
    if (!isDrawing) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.closePath()

    setIsDrawing(false)

    setUndoStack([...undoStack, canvas.toDataURL()])
  }

  function getMousePositionOnCanvas(event) {
    const clientX = event.clientX || event.touches[0].clientX
    const clientY = event.clientY || event.touches[0].clientY

    const { offsetLeft, offsetTop } = event.target

    const canvasX = clientX - offsetLeft
    const canvasY = clientY - offsetTop

    return { x: canvasX, y: canvasY }
  }

  const draw = (event: MouseEvent<HTMLCanvasElement & HTMLDivElement>) => {
    if (!isDrawing || !canDraw) {
      return
    }

    const { x, y } = getMousePositionOnCanvas(event.nativeEvent)

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.lineWidth = currentLineWidth
    context.strokeStyle = getCurrentColor()
    context.lineTo(x, y)
    context.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current

    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)

    setUndoStack([canvas.toDataURL()])
  }

  useEffect(() => {
    prepareCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing="4" direction="row" justifyContent="space-between">
      <Box flex="0 0 100px">
        <SimpleGrid columns={2} spacing="2">
          {COLORS.map(({ value, iconColor }) => (
            <Button
              key={value}
              onClick={() => {
                setCurrentColor(value)
              }}
              backgroundColor={value}
              height={10}
              borderRadius="md"
              disabled={!canDraw || currentTool === TOOL.ERASER}
              colorScheme="transparent"
              padding="0"
            >
              <Icon
                as={MdCheck}
                color={value === currentColor ? iconColor : value}
                height={8}
                width={8}
              />
            </Button>
          ))}
        </SimpleGrid>
      </Box>
      <Stack spacing="4" flex="1">
        <Box
          as="canvas"
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
          onMouseMove={draw}
          // @ts-ignore
          ref={canvasRef}
          borderRadius="md"
          marginX="auto"
          cursor="crosshair"
        />
        <Stack
          spacing="8"
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            spacing="2"
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            {SHAPE_SIZES.map(({ value }) => (
              <Button
                key={value}
                onClick={() => {
                  setCurrentLineWidth(value)
                }}
                variant={currentLineWidth === value ? 'solid' : 'ghost'}
                colorScheme="tertiary"
                disabled={!canDraw}
                padding="1"
              >
                <Box
                  width={`${value + 2}px`}
                  height={`${value + 2}px`}
                  backgroundColor={
                    currentLineWidth === value
                      ? 'background.500'
                      : 'tertiary.500'
                  }
                  borderRadius="full"
                />
              </Button>
            ))}
          </Stack>
          {doneButton}
        </Stack>
      </Stack>
      <Stack spacing="2" width="100px">
        <Button
          leftIcon={<MdEdit />}
          onClick={() => {
            if (currentTool === TOOL.ERASER) {
              setCurrentColor(colorBeforeEraser)
              setColorBeforeEraser('')
            }

            setCurrentTool(TOOL.PENCIL)
          }}
          variant={currentTool === TOOL.PENCIL ? 'solid' : 'ghost'}
          colorScheme="tertiary"
          disabled={!canDraw}
        >
          Pencil
        </Button>
        <Button
          leftIcon={<BiEraser />}
          onClick={() => {
            setColorBeforeEraser(currentColor)
            setCurrentColor('white')
            setCurrentTool(TOOL.ERASER)
          }}
          variant={currentTool === TOOL.ERASER ? 'solid' : 'ghost'}
          colorScheme="tertiary"
          disabled={!canDraw}
        >
          Eraser
        </Button>
        <Button
          leftIcon={<MdFormatColorFill />}
          onClick={() => {
            if (currentTool === TOOL.ERASER) {
              setCurrentColor(colorBeforeEraser)
              setColorBeforeEraser('')
            }

            setCurrentTool(TOOL.BUCKET)
          }}
          variant={currentTool === TOOL.BUCKET ? 'solid' : 'ghost'}
          colorScheme="tertiary"
          disabled={!canDraw}
        >
          Bucket
        </Button>
        <Button
          leftIcon={<MdUndo />}
          onClick={() => {
            handleUndo()
          }}
          variant="ghost"
          colorScheme="tertiary"
          disabled={!canDraw || !(undoStack.length > 1)}
          ref={undoRef}
        >
          Undo
        </Button>
        <Button
          leftIcon={<MdDelete />}
          onClick={clearCanvas}
          variant="ghost"
          colorScheme="tertiary"
          disabled={!canDraw}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  )
}
