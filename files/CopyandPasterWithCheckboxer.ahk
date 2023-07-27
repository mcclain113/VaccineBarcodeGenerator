; Upon entering the windows+b hotkey, this script gets a range of cells in column A through (pick your number). 
; It will copy and paste the contents of each cell and tab over. After the last cell in the column, it will go to the next row and do
; the samething until there are no more cells (i.e. a blank cell). NOTE, the script starts at A2, so it assumes you have a header.

; Usage:
; Press windows button+b to activate.

; Constants
xlDown := -4121

WorkbookPath := A_ScriptDir "\copyandpaster.xlsx"       ; <-- Change this to the path of your workbook
ColumnStart := 0					; Enter in the Offset the range of columns. Always start at 0
ColumnEnd := 0 					; Enter in the Offset the range of columns. Computers consider "0" as 1, so 3 columns (A,B,C) would be 0,2.
xlApp := ComObjCreate("Excel.Application")                            ; Create an instance of Excel
xlApp.Visible := true                                                          ; Make Excel visible
MyWorkbook := xlApp.Workbooks.Open(WorkbookPath)                                ; Open the workbook
CellA2 := xlApp.Cells(2, 1)                                          ; Store a reference to cell A2
LastCell := CellA2.End(xlDown).Offset(ColumnStart, ColumnEnd)  		;  End is like pressing Ctrl+Down
MyRange := xlApp.Range(CellA2, LastCell)               ; Store a reference to the Range A2:LastCell
CellNumber := 1                                   ; This variable will store the cell number to use
CellCount := MyRange.Cells.Count                            ; Store the count of cells in the range
return

#b::                                                                           ; windows button+b hotkey
   Loop {									
        if (CellNumber > CellCount) {    ; If 'CellNumber' is greater than the total amount of cells...
        MsgBox, 64, Info, Finished. No more cells.                                           ; Done
        CellNumber := 1
	MultiVar := 1
	break
    }
    SendRaw % MyRange.Cells(CellNumber).Text      ; Loop and send the current cell specified by 'CellNumber'
    CellNumber++                                                     ; Increase 'CellNumber' by one
    Sleep, 1500								; slow down or speed up 1 sec = 1000microseconds rec 9.5 without intervention



	Send, {Down}
	Sleep, 200	
	Send, {Space}
	Sleep, 200
	Send, ^a
	Sleep, 200
	Send, {BACKSPACE}
	Sleep, 200


}
return
Esc::ExitApp  ;Escape key will exit


; References
; https://autohotkey.com/boards/viewtopic.php?p=112648#p112648
; https://github.com/ahkon/MS-Office-COM-Basics/blob/master/Examples/Excel/Cells_in_a_column.ahk
; Updated by Barry McClain to loop, tab over, included a speed throttle, abort, and some other clean up