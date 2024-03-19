/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
}

declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
