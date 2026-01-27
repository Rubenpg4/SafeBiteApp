/**
 * SERVICIO DE USUARIO - Operaciones con Firestore
 * Gestiona documentos de usuario y su historial de escaneos
 */

import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

// Tipos para Firestore
export interface UserDocument {
    selectedAllergens: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ScanHistoryDocument {
    barcode: string;
    productName: string;
    brand?: string;
    imageUrl?: string;
    ingredients?: string;       // Ingredientes del producto
    allergenIds: string[];      // IDs de alérgenos del producto para recálculo dinámico
    isSafe: boolean;            // Valor calculado al momento del escaneo (histórico)
    scannedAt: Timestamp;
}

export interface ScanHistoryItem extends Omit<ScanHistoryDocument, 'scannedAt'> {
    id: string;
    scannedAt: Date;
}

// Referencia a la colección de usuarios
const USERS_COLLECTION = 'users';
const SCAN_HISTORY_SUBCOLLECTION = 'scanHistory';

/**
 * Crea el documento de usuario en Firestore (al registrar)
 */
export const createUserDocument = async (
    uid: string,
    initialAllergens: string[] = []
): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await setDoc(userRef, {
        selectedAllergens: initialAllergens,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

/**
 * Obtiene los alérgenos seleccionados del usuario
 */
export const getUserAllergens = async (uid: string): Promise<string[]> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data() as UserDocument;
        return data.selectedAllergens || [];
    }

    return [];
};

/**
 * Actualiza los alérgenos seleccionados del usuario
 */
export const updateUserAllergens = async (
    uid: string,
    allergens: string[]
): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // Documento existe, actualizar
        await updateDoc(userRef, {
            selectedAllergens: allergens,
            updatedAt: serverTimestamp()
        });
    } else {
        // Documento no existe, crear
        await createUserDocument(uid, allergens);
    }
};

/**
 * Agrega un escaneo al historial del usuario
 * Si el producto ya existe (mismo barcode), lo elimina primero (upsert)
 */
export const addScanToHistory = async (
    uid: string,
    scanData: Omit<ScanHistoryDocument, 'scannedAt'>
): Promise<string> => {
    const historyRef = collection(db, USERS_COLLECTION, uid, SCAN_HISTORY_SUBCOLLECTION);

    // Buscar si ya existe un escaneo con este barcode
    const existingQuery = query(historyRef, where('barcode', '==', scanData.barcode));
    const existingDocs = await getDocs(existingQuery);

    // Eliminar escaneos anteriores del mismo producto
    const deletePromises = existingDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    if (existingDocs.size > 0) {
        console.log(`[UserService] Deleted ${existingDocs.size} existing scan(s) for barcode: ${scanData.barcode}`);
    }

    // Añadir el nuevo escaneo
    const docRef = await addDoc(historyRef, {
        ...scanData,
        scannedAt: serverTimestamp()
    });

    return docRef.id;
};

/**
 * Elimina un escaneo del historial del usuario
 */
export const deleteScanFromHistory = async (
    uid: string,
    scanId: string
): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, SCAN_HISTORY_SUBCOLLECTION, scanId);
    await deleteDoc(docRef);
};

/**
 * Obtiene el historial de escaneos del usuario
 * @param uid - ID del usuario
 * @param maxItems - Número máximo de items a obtener (default: 50)
 */
export const getScanHistory = async (
    uid: string,
    maxItems: number = 50
): Promise<ScanHistoryItem[]> => {
    const historyRef = collection(db, USERS_COLLECTION, uid, SCAN_HISTORY_SUBCOLLECTION);
    const q = query(
        historyRef,
        orderBy('scannedAt', 'desc'),
        limit(maxItems)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data() as ScanHistoryDocument;
        return {
            id: doc.id,
            barcode: data.barcode,
            productName: data.productName,
            brand: data.brand,
            imageUrl: data.imageUrl,
            ingredients: data.ingredients,
            allergenIds: data.allergenIds || [],
            isSafe: data.isSafe,
            scannedAt: data.scannedAt?.toDate() || new Date()
        };
    });
};

/**
 * Verifica si el documento de usuario existe
 */
export const userDocumentExists = async (uid: string): Promise<boolean> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
};
