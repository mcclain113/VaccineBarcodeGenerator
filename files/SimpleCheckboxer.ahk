#b:: 				; windows button+b hotkey
InputBox, UserInput, Click Number, Please enter number of clicks:, , 300, 150
ClickNumber := 1                        
ClickCount := UserInput
return

#/:: 				; windows+/ hotkey
   Loop {									
    SendInput {Down}
    Sleep, 50
    SendInput {Space}
    ClickNumber++                                                     ; Increase 'ClickNumber' by one
    Sleep, 50								; slow down or speed up 1 sec = 1000microseconds
    if (ClickNumber > ClickCount) {    ; If 'ClickNumber' is greater than the total amount of clicks
        MsgBox, 64, Info, Finished Clicking %UserInput% Boxes           ; Done
        ClickNumber := 1
	break
    }
}
return
Esc::ExitApp  ;Escape key will exit
