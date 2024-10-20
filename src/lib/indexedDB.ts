import { openDB } from 'idb';

const dbName = 'fileSystemDB';
const storeName = 'files';

export const initDB = async () => {
    const db = await openDB(dbName, 1, {
        upgrade(db) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
        },
    })
    return db
}

export const getAllFiles = async () => {
    const db = await initDB()
    return await db.getAll(storeName)
}

export const addFile = async (file: { 
    name: string; 
    type: string; 
    parentId: number | null
}) => {
    const db = await initDB()
    return await db.add(storeName, file)
}

export const deleteFile = async (id: number) => {
    const db = await initDB()
    return await db.delete(storeName, id)
}