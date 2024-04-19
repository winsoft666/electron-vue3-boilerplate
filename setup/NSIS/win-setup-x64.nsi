!define PRODUCT_NAME            "Electron-Vue3-Boilerplate"
!define PRODUCT_DESC            "A Electron + Vue3 boilerplate."
!define EXE_NAME                 "Electron-Vue3-Boilerplate.exe"
!define PRODUCT_VERSION         "1.0.0.0"
!define PRODUCT_PUBLISHER       "https://github.com/winsoft666/"
!define PRODUCT_LEGAL            "Copyright (C) 2024. All Rights Reserved"
!define DESKTOP_LNK_NAME         "Electron-Vue3-Boilerplate"
!define REG_ORGANIZATION_NAME   "Electron-Vue3-Boilerplate"
!define REG_APPLICATION_NAME    "Electron-Vue3-Boilerplate"

!include "MUI2.nsh"
!include "FileFunc.nsh"
!insertmacro GetParameters
!insertmacro GetOptions

SetCompressor LZMA
Unicode True

Name "${PRODUCT_NAME}"
OutFile "${PRODUCT_NAME}-Setup-x64.exe"
InstallDir "$LocalAppdata\Programs\${PRODUCT_NAME}"
ShowInstDetails hide
ShowUnInstDetails hide
ManifestDPIAware true

BrandingText "${REG_ORGANIZATION_NAME}"
# RequestExecutionLevel none|user|highest|admin
RequestExecutionLevel user

!define MUI_ICON              ".\install.ico"
!define MUI_UNICON            ".\install.ico"
!define MUI_CUSTOMFUNCTION_GUIINIT onGUIInit

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE ".\license.rtf"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

VIProductVersion                       "${PRODUCT_VERSION}"
VIAddVersionKey "ProductVersion"    "${PRODUCT_VERSION}"
VIAddVersionKey "ProductName"       "${PRODUCT_NAME}"
VIAddVersionKey "CompanyName"       "${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileVersion"       "${PRODUCT_VERSION}"
VIAddVersionKey "InternalName"      "${EXE_NAME}"
VIAddVersionKey "FileDescription"   "${PRODUCT_DESC}"
VIAddVersionKey "LegalCopyright"    "${PRODUCT_LEGAL}"

Var RunByAs

!macro ParseParameters
    ${GetParameters} $R0
    ${GetOptions} $R0 '-RunByAs' $R1
    StrCpy $RunByAs $R1
!macroend


Section "!Files"
	SetPluginUnload alwaysoff
	SetOutPath $INSTDIR

	# TODO
	File /r "..\..\out\Electron-Vue3-Boilerplate-win32-x64\*"
SectionEnd


Section "Shortcut"
	SetPluginUnload alwaysoff
	SetShellVarContext current

	CreateShortCut "$DESKTOP\${DESKTOP_LNK_NAME}.lnk" "$INSTDIR\${EXE_NAME}"
	CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
	CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${DESKTOP_LNK_NAME}.lnk" "$INSTDIR\${EXE_NAME}"
	CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\uninst.exe"
SectionEnd

Section "-Necessary"
	SetPluginUnload alwaysoff
	WriteUninstaller "$INSTDIR\uninst.exe"
	
	WriteRegStr HKCU "Software\${REG_ORGANIZATION_NAME}\${REG_APPLICATION_NAME}" "Path" "$INSTDIR"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninst.exe"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\${EXE_NAME}"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "${PRODUCT_PUBLISHER}"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "URLInfoAbout" "${PRODUCT_PUBLISHER}"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "HelpLink" "${PRODUCT_PUBLISHER}"
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
SectionEnd

Section "-Uninstall"
	SetPluginUnload alwaysoff
	
	SetShellVarContext current
	Delete "$SMPROGRAMS\${PRODUCT_NAME}\${DESKTOP_LNK_NAME}.lnk"
	Delete "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk"
	RMDir "$SMPROGRAMS\${PRODUCT_NAME}\"
	Delete "$DESKTOP\${DESKTOP_LNK_NAME}.lnk"

	RMDir /r "$INSTDIR"

	DeleteRegKey HKCU "Software\${REG_ORGANIZATION_NAME}"
	DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
	SetAutoClose true
SectionEnd

Function .onInit    
    ReadRegStr $R0 HKCU "Software\${REG_ORGANIZATION_NAME}\${REG_APPLICATION_NAME}" "Path"
    ${If} $R0 != ""
        StrCpy $INSTDIR $R0
    ${EndIf}
FunctionEnd

Function .onVerifyInstDir
	# TODO
FunctionEnd

Function onGUIInit
	# TODO
FunctionEnd


Function .onInstSuccess
	Exec '"$INSTDIR\${EXE_NAME}" -BySetup'
FunctionEnd


Function un.onInit
    StrCpy $RunByAs ""
    
    !insertmacro ParseParameters
    
    ${If} "$RunByAs" != "1"
		ExecShell "runas" "$INSTDIR\uninst.exe" "-RunByAs 1"
		Abort
	${EndIf}
FunctionEnd

Function un.onUninstSuccess
	# TODO
FunctionEnd