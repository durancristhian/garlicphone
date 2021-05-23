import { firestore } from 'firebase/init'
import { addPlayerToRoom } from 'utils/addPlayerToRoom'

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

      const adminRef = await addPlayerToRoom({ roomId, name: adminName })
      const adminId = adminRef.id

      await roomRef.set({
        name,
        adminId,
        activity: [],
        stepTime: 60,
      })

      resolve({ roomId, adminId })
    } catch (error) {
      reject(error)
    }
  })
}
