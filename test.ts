let strip = robotAtom.initNeopixel()
strip.setBrightness(20)
strip.showColor(robotAtom.colors(NeoPixelColors.Yellow))


input.onButtonPressed(Button.A, function() {
    strip.showColor(robotAtom.colors(NeoPixelColors.Red))
})
input.onButtonPressed(Button.B, function () {
    strip.showColor(robotAtom.colors(NeoPixelColors.Blue))
})