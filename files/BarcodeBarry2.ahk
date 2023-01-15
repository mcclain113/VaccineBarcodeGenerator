#Persistent
OnClipboardChange("ClipChanged")
return

ClipChanged(Type) {
if (Type = "1")
{
	WinActivate,Hyperspace - Aurora Smart Chart
	send \
	Sleep, 1
	SendRaw %clipboard%
	Sleep, 1
	send \
	Sleep, 1
	Send, {Enter}
}
else if (Type = "2")
{
    ToolTip Clipboard data type: %Type%
    Sleep 1000
    ToolTip  ; Turn off the tip.
}
else
{
    return
}

}


