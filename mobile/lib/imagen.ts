import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

/** Lado más largo con el que se envía la foto a la IA: suficiente para ver la hoja y rápido de subir. */
const LADO_MAXIMO = 1280;

/**
 * Reduce la foto a 1280 px por su lado más largo y la devuelve en base64 (JPEG).
 * Si no se puede reducir, devuelve la foto original en base64.
 */
export async function prepararFoto(uri: string, ancho?: number, alto?: number): Promise<string | null> {
  try {
    const contexto = ImageManipulator.manipulate(uri);
    const largo = Math.max(ancho || 0, alto || 0);
    if (!largo || largo > LADO_MAXIMO) {
      contexto.resize((alto || 0) > (ancho || 0) ? { height: LADO_MAXIMO } : { width: LADO_MAXIMO });
    }
    const imagen = await contexto.renderAsync();
    const resultado = await imagen.saveAsync({ base64: true, compress: 0.8, format: SaveFormat.JPEG });
    if (resultado.base64) return resultado.base64;
  } catch (e) {
    console.warn('No se pudo reducir la foto, se envía la original:', e);
  }
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch {
    return null;
  }
}
