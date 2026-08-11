import Game from "./Game"
import { Sprite, Text } from "pixi.js"


/**
 *
 * @type {ScreenDefinition}
 */
const Title = {
    name: "Title",

    init: (ctx) => {

        console.log("Title init()")

        const { app, buttons } = ctx;

        const { width, height } = app.canvas;

        const cx = width >> 1
        const cy = height >> 1

        const sprite = Sprite.from("title.png")

        const w = sprite.width << 1;
        const h = sprite.height << 1;

        sprite.anchor = 0.5
        sprite.x = cx
        sprite.y = cy - h/2
        sprite.width = w
        sprite.height = h

        const buttonSprite = Sprite.from(buttons[0])
        buttonSprite.anchor = 0.5
        buttonSprite.x = cx
        buttonSprite.y = cy + buttonSprite.height/2

        app.stage.addChild(sprite)
        app.stage.addChild(buttonSprite)

        ctx.onPrimaryButton( () => {
            ctx.runScreen(Game)
        })

        return () => {
            console.log("Title destroy()")
            app.stage.removeChild(sprite)
            app.stage.removeChild(buttonSprite)
        }
    }
}

export default Title
