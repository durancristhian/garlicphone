import { Image, Spinner, Stack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import StringSanitizer from 'string-sanitizer'

type Props = {
  seed: string
  size?: string
}

export function Avatar({ seed, size = '48px' }: Props) {
  const text = useMemo(() => {
    return StringSanitizer.sanitize(seed.toLocaleLowerCase())
  }, [seed])

  return (
    <Image
      src={`https://avatars.dicebear.com/api/human/${text}.svg`}
      height={size}
      width={size}
      fallback={
        <Stack
          height={size}
          width={size}
          alignItems="center"
          justifyContent="center"
        >
          <Spinner color="tertiary.500" />
        </Stack>
      }
    />
  )
}
