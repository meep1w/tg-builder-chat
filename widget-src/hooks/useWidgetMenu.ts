const { useSyncedState, usePropertyMenu } = figma.widget
import { THEME_MODES, DIMENSIONS } from "../constants"

const VAULT_NS = "tg_vault" as const
const LEGACY_VAULT_NS = "tg-vault" as const

const VAULT_KEYS = { avatar: "avatarHash", wallpaper: "wallpaperHash" } as const
const DATA_KEYS = { avatar: "avatarDataURL" } as const
const AVATAR = { prefix: "avatarDataURL_", meta: "avatarChunks" } as const
const WALL   = { prefix: "wallpaperDataURL_", meta: "wallpaperChunks" } as const

function safeGetShared(ns: string, key: string): string {
  try { const v = figma.currentPage.getSharedPluginData(ns, key) || ""; if (v) return v } catch {}
  try { return figma.root.getSharedPluginData(ns, key) || "" } catch { return "" }
}
function readDataURLFromChunks(metaKey: string, prefix: string): string {
  const meta = safeGetShared(VAULT_NS, metaKey) || safeGetShared(LEGACY_VAULT_NS, metaKey)
  const n = Number(meta) || 0; if (!n) return ""
  let out = ""; for (let i=0;i<n;i++) {
    out += safeGetShared(VAULT_NS, `${prefix}${i}`) || safeGetShared(LEGACY_VAULT_NS, `${prefix}${i}`) || ""
  } return out
}

interface useWidgetMenuConfig { config: {
  chatId: number; displayMode: number; viewport: number; isEditMode: boolean; theme: ThemeModes
  avatarHash?: string | null; wallpaperHash?: string | null; avatarSrc?: string | null; wallpaperSrc?: string | null
}}
const defaultConfig: useWidgetMenuConfig["config"] = {
  chatId:0, displayMode:0, viewport:0, isEditMode:true, theme: THEME_MODES[0],
  avatarHash:null, wallpaperHash:null, avatarSrc:null, wallpaperSrc:null
}

type UseWidgetMenuOpts = Partial<useWidgetMenuConfig> & { attachPropertyMenu?: boolean }

export default function useWidgetMenu({ config = defaultConfig, attachPropertyMenu = true }: UseWidgetMenuOpts = {}) {
  const initialAvatarHash: string | null =
    config.avatarHash ?? (safeGetShared(VAULT_NS, VAULT_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.avatar) || null)
  const initialWallpaperHash: string | null =
    config.wallpaperHash ?? (safeGetShared(VAULT_NS, VAULT_KEYS.wallpaper) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.wallpaper) || null)

  const initialAvatarSrc: string | null =
    config.avatarSrc ?? (readDataURLFromChunks(AVATAR.meta, AVATAR.prefix) || safeGetShared(VAULT_NS, DATA_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, DATA_KEYS.avatar) || null)
  const initialWallpaperSrc: string | null =
    config.wallpaperSrc ?? (readDataURLFromChunks(WALL.meta, WALL.prefix) || null)

  const [chatId, setChatId] = useSyncedState<number>("chatId", config.chatId)
  const [displayMode, setDisplayMode] = useSyncedState<number>("displayMode", config.displayMode)
  const [viewport, setViewport] = useSyncedState<number>("viewport", config.viewport)
  const [theme, setTheme] = useSyncedState<ThemeModes>("theme", config.theme)
  const [isEditMode, setIsEditMode] = useSyncedState("isEditMode", config.isEditMode)

  const [avatarHash, setAvatarHash] = useSyncedState<string | null>("avatarHash", initialAvatarHash)
  const [wallpaperHash, setWallpaperHash] = useSyncedState<string | null>("wallpaperHash", initialWallpaperHash)
  const [avatarSrc, setAvatarSrc] = useSyncedState<string | null>("avatarSrc", initialAvatarSrc)
  const [wallpaperSrc, setWallpaperSrc] = useSyncedState<string | null>("wallpaperSrc", initialWallpaperSrc)

  // === Header actions toggle
  const [showHeaderActions, setShowHeaderActions] = useSyncedState<boolean>("showHeaderActions", false)

  // === New User Card state
  const [showNewUserCard, setShowNewUserCard] = useSyncedState<boolean>("showNewUserCard", true)
  const [profileName,   setProfileName]   = useSyncedState<string>("profileName",   "Random User")
  const [profileCountry,setProfileCountry]= useSyncedState<string>("profileCountry","🇳🇬 Nigeria")
  const [profileReg,    setProfileReg]    = useSyncedState<string>("profileReg",    "January 2024")

  const svgPaths = {
    edit:`<svg width='14' height='14' viewBox='0 0 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M61.48 1.15999L70.84 10.52C72.4 12.08 72.4 14.6 70.84 16.16L63.52 23.48L48.52 8.47999L55.84 1.15999C57.4 -0.40001 59.92 -0.40001 61.48 1.15999ZM0 72V57L44.24 12.76L59.24 27.76L15 72H0Z' fill='#BBBBBB'/></svg>`,
    hide:`<svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.9998 0.5L13.9998 12.5M11.3748 10.0669C10.3603 10.6134 9.21375 10.9999 7.9998 10.9999C5.35181 10.9999 3.02456 9.16085 1.68998 7.83411C1.3377 7.48389 1.16159 7.3088 1.04948 6.96509C0.969522 6.71996 0.969497 6.27993 1.04948 6.03481C1.16163 5.6911 1.3381 5.51559 1.69108 5.16475C2.36374 4.49616 3.28839 3.69769 4.37902 3.07007M13.6248 8.47513C13.8745 8.25538 14.1034 8.03922 14.3086 7.8352L14.3108 7.83292C14.6623 7.48357 14.8385 7.30841 14.9504 6.96546C15.0304 6.72034 15.0302 6.28013 14.9503 6.035C14.8382 5.6914 14.6619 5.51581 14.3098 5.16583C12.9752 3.83906 10.6477 2 7.9998 2C7.74667 2 7.49648 2.01681 7.2498 2.04836M8.99198 7.625C8.72753 7.85838 8.3802 8 7.9998 8C7.17137 8 6.4998 7.32843 6.4998 6.5C6.4998 6.09538 6.66001 5.72831 6.92046 5.4585" stroke="#BBBBBB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    mode:`<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13C10.3137 13 13 10.3137 13 7Z' stroke='#BBBBBB' stroke-width='1.6'/><path d='M7 1L11.5 2.5L13.5 7L11.5 12L7 13V1Z' fill='#BBBBBB'/></svg>`,
    upload:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V4M12 4L7 9M12 4l5 5" stroke="#BBBBBB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#BBBBBB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    show:`<svg width='16' height='9' viewBox='0 0 20 12' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M1.5868 7.77881C3.36623 9.54783 6.46953 11.9999 10.0002 11.9999C13.5308 11.9999 16.6335 9.54783 18.413 7.77881C18.8823 7.31226 19.1177 7.07819 19.2671 6.62012C19.3738 6.29328 19.3738 5.70674 19.2671 5.3799C19.1177 4.92181 18.8823 4.6877 18.413 4.22111C16.6335 2.45208 13.5308 0 10.0002 0C6.46953 0 3.36623 2.45208 1.5868 4.22111C1.11714 4.68802 0.882286 4.92165 0.732796 5.3799C0.626177 5.70673 0.626177 6.29328 0.732796 6.62012C0.882286 7.07837 1.11714 7.31189 1.5868 7.77881Z' stroke='#BBBBBB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><path d='M8 6C8 7.10457 8.89543 8 10 8C11.1046 8 12 7.10457 12 6C12 4.89543 11.1046 4 10 4C8.89543 4 8 4.89543 8 6Z' stroke='#BBBBBB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  }

  const optionalMenuItem = <T extends PropertyMenuItem>(x: T, c: boolean): [T] | [] => (c ? [x] : [])

  if (attachPropertyMenu) {
    usePropertyMenu(
      [
        { itemType: "dropdown", propertyName: "chat", tooltip: "Change Context (Recipient)", selectedOption: ["bot","friend","none"][chatId], options: [{option:"bot",label:"Bot Chat"},{option:"friend",label:"Friend Chat"},{option:"none",label:"Empty Chat"}] },
        { itemType: "dropdown", propertyName: "display", tooltip: "Chat Display Mode", selectedOption: ["phone","viewport","messages","message"][displayMode], options: [
          {option:"phone",label:"Framed Phone"},{option:"viewport",label:"Viewport (scrollable)"},{option:"messages",label:"Chat Messages"},{option:"message",label:"Last Message Only"}] },
        ...optionalMenuItem({ itemType: "dropdown", propertyName: "viewport", tooltip: "Viewport Dimensions chat",
          selectedOption: ["lg","md","sm"][viewport], options: [
            { option:"lg", label:`${DIMENSIONS[0].width}x${DIMENSIONS[0].height} (Default)` },
            { option:"md", label:`${DIMENSIONS[1].width}x${DIMENSIONS[1].height} (Iphone 12/13 Pro)` },
            { option:"sm", label:`${DIMENSIONS[2].width}x${DIMENSIONS[2].height} (Iphone SE)` },
          ] }, displayMode === 1),
        { itemType: "separator" },

        { itemType: "toggle", propertyName: "toggle-header-actions", tooltip: "Show “Block / Add to Contacts”", isToggled: showHeaderActions },
        { itemType: "toggle", propertyName: "toggle-new-user-card", tooltip: "Show New User Card", isToggled: showNewUserCard },

        { itemType: "separator" },
        { itemType: "action", propertyName: "theme", tooltip: theme === "light" ? "Dark Theme" : "Light Theme", icon: svgPaths.mode },
        { itemType: "action", propertyName: "edit", tooltip: isEditMode ? "Display Mode (Hide Builder)" : "Edit Mode (New Messages)", icon: isEditMode ? svgPaths.hide : svgPaths.edit },
        { itemType: "separator" },
        { itemType: "action", propertyName: "uploadAvatar", tooltip: "UPLOAD AVATAR (pull from helper plugin)", icon: svgPaths.upload },
        { itemType: "action", propertyName: "uploadWallpaper", tooltip: "UPLOAD WALLPAPER (pull from helper plugin)", icon: svgPaths.upload },
        { itemType: "action", propertyName: "debugReadHashes", tooltip: "Debug: read hashes", icon: svgPaths.show },
      ],
      ({ propertyName, propertyValue }) => {
        try {
          switch (propertyName) {
            case "chat": setChatId(["bot","friend","none"].findIndex((o) => o === propertyValue)); break
            case "display": setDisplayMode(["phone","viewport","messages","message"].findIndex((o) => o === propertyValue)); break
            case "viewport": setViewport(["lg","md","sm"].findIndex((o) => o === propertyValue)); break
            case "theme": setTheme((prev) => THEME_MODES[(THEME_MODES.findIndex((m) => m === prev) + 1) % THEME_MODES.length]); break
            case "edit": setIsEditMode(!isEditMode); break
            case "toggle-header-actions": setShowHeaderActions(!showHeaderActions); break
            case "toggle-new-user-card": setShowNewUserCard(!showNewUserCard); break
            case "uploadAvatar": {
              const hash = safeGetShared(VAULT_NS, VAULT_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.avatar)
              const data = readDataURLFromChunks(AVATAR.meta, AVATAR.prefix) || safeGetShared(VAULT_NS, DATA_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, DATA_KEYS.avatar)
              if (hash || data) { if (hash) setAvatarHash(hash); if (data) setAvatarSrc(data); figma.notify?.(`Avatar updated from vault${hash ? " (hash)" : ""}${data ? " (dataURL)" : ""}`) }
              else figma.notify?.('No avatar in vault. Run "Telegram Widget — Asset Vault" → Upload Avatar')
              break
            }
            case "uploadWallpaper": {
              const hash = safeGetShared(VAULT_NS, VAULT_KEYS.wallpaper) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.wallpaper)
              const data = readDataURLFromChunks(WALL.meta, WALL.prefix)
              if (hash || data) { if (hash) setWallpaperHash(hash); if (data) setWallpaperSrc(data); figma.notify?.(`Wallpaper updated from vault${hash ? " (hash)" : ""}${data ? " (dataURL)" : ""}`) }
              else figma.notify?.('No wallpaper in vault. Run "Telegram Widget — Asset Vault" → Upload Wallpaper')
              break
            }
            case "debugReadHashes": {
              const a  = safeGetShared(VAULT_NS, VAULT_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.avatar)
              const w  = safeGetShared(VAULT_NS, VAULT_KEYS.wallpaper) || safeGetShared(LEGACY_VAULT_NS, VAULT_KEYS.wallpaper)
              const aLegacySrc = safeGetShared(VAULT_NS, DATA_KEYS.avatar) || safeGetShared(LEGACY_VAULT_NS, DATA_KEYS.avatar)
              const aMeta = safeGetShared(VAULT_NS, AVATAR.meta) || safeGetShared(LEGACY_VAULT_NS, AVATAR.meta)
              const wMeta = safeGetShared(VAULT_NS, WALL.meta)   || safeGetShared(LEGACY_VAULT_NS, WALL.meta)
              figma.notify?.(`Avatar: ${a || "(empty)"}; chunks: ${aMeta || 0}${aLegacySrc ? " + legacy[dataURL]" : ""} | Wallpaper: ${w || "(empty)"}; chunks: ${wMeta || 0}`)
              break
            }
          }
        } catch (err) { figma.notify?.("Menu handler error: " + (err as Error).message) }
      },
    )
  }

  return {
    chatId, displayMode, viewport, theme, isEditMode,
    avatarHash, wallpaperHash, avatarSrc, wallpaperSrc,
    showHeaderActions, setShowHeaderActions,
    showNewUserCard, setShowNewUserCard,
    profileName, setProfileName, profileCountry, setProfileCountry, profileReg, setProfileReg,
  }
}
