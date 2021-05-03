import { firestore, Timestamp } from 'firebase/init'
import { ROOM_STATUS } from 'types/Room'
import { createPlayer } from './createPlayer'

export function createRoom({
  name,
  adminName,
}: {
  name: string
  adminName: string
}): Promise<{ roomId: string; adminId: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const roomRef = firestore.collection('rooms').doc()
      const roomId = roomRef.id

      const adminRef = await createPlayer({ roomId, name: adminName })
      const adminId = adminRef.id

      await roomRef.set({
        name,
        adminId,
        status: ROOM_STATUS.CREATED,
        createdAt: Timestamp.fromDate(new Date()),
      })

      resolve({ roomId, adminId })
    } catch (error) {
      console.error(error)

      reject(error)
    }
  })
}
