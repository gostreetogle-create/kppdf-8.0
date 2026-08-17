; TZD-56: перед update остановить Desktop и его child Node (иначе locked llama .node).
; Чужие node.exe не трогаем — только дерево KPPDF Desktop.exe.

!macro NSIS_HOOK_PREINSTALL
  nsExec::Exec 'taskkill /IM "KPPDF Desktop.exe" /T /F'
  Sleep 2000
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  nsExec::Exec 'taskkill /IM "KPPDF Desktop.exe" /T /F'
  Sleep 2000
!macroend
