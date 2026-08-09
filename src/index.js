import "./style.css"
import { Application, Assets, Texture } from 'pixi.js';
import { CompositeTilemap, Tilemap } from "@pixi/tilemap"
import perfNow from 'performance-now';
import { buttonPressed } from "./util"

// Create a PixiJS application.
const app = new Application();

let gamepad

const BUTTON_STYLES = [
    {
        name: "Nintendo",
        buttons: [
            "nintendo-button0.png",
            "nintendo-button1.png",
            "nintendo-button2.png",
            "nintendo-button3.png",
        ]
    },
    {
        name: "Playstation",
        buttons: [
            "playstation-button0.png",
            "playstation-button1.png",
            "playstation-button2.png",
            "playstation-button3.png",
        ]
    },
    {
        name: "X-Box",
        buttons: [
            "xbox-button0.png",
            "xbox-button1.png",
            "xbox-button2.png",
            "xbox-button3.png",
        ]
    },
]

let buttons 


function logGamepadState()
{
    if (!gamepad)
    {
        return
    }

    const { buttons } = gamepad
    for (let i = 0; i < buttons.length; i++)
    {
        if (buttonPressed(buttons[i]))
        {
            console.log("Button #" + i + " pressed" )
        }
    }

    //console.log("AXES: " + gamepad.axes.map(axis => axis.toFixed(4)))

}

function getGamepadInfo(gp)
{
    return `[Gamepad #${gp.index}: ${gp.buttons.length} buttons / ${gp.axes.length} axes]`
}





// Intialize the application.
app.init({ background: '#16161d', resizeTo: window })
    .then(
        () => {
            buttons = BUTTON_STYLES[0].buttons

            console.log("BUTTONS", buttons)

            // Then adding the application's canvas to the DOM body.
            document.body.appendChild(app.canvas);
            
            Assets.add({ alias: 'atlas', src: 'assets/atlas-0.json'});

            // const tilemap2 = new CompositeTilemap();
            // app.stage.addChild(tilemap2);
            Assets.load(['atlas']).then(() =>
            {
                let tilemap = new Tilemap([Texture.from("smiley.png").source]);
                app.stage.addChild(tilemap);

                const size = 20

                const ox = 0
                const oy = 0


                let x = ox + 96 + 16, y = oy + 96


                function build(x,y)
                {
                    // app.stage.removeChild(tilemap);
                    // tilemap = new Tilemap([Texture.from("smiley.png").source]);
                    // app.stage.addChild(tilemap);
                    tilemap.clear()
                    app.stage.renderGroup.onChildUpdate(tilemap);
                    for (let y = 0; y < size; y++)
                    {
                        for (let x = 0; x < size; x++)
                        {
                            const isBorder = (x === 0) || (x === size - 1) || (y === 0) || (y === size - 1)
                            tilemap.tile(isBorder || Math.random() < 0.5 ? "wall.png" : "floor.png", ox + x * 32, oy + y * 32)
                        }
                    }

                    tilemap.tile(buttons[(x>>4)&3], x | 0, y)
                }

                app.ticker.add(time => {
                    x += time.deltaTime
                    build(x,y)

                    logGamepadState()
                })
            });

            window.addEventListener("gamepadconnected", (e) => {

                gamepad = navigator.getGamepads()[e.gamepad.index];
                console.log(getGamepadInfo(gamepad), "connected")
            });

            window.addEventListener("gamepaddisconnected", (e) => {
                gamepad = null
                console.log(getGamepadInfo(navigator.getGamepads()[e.gamepad.index]), "disconnected")
            });

        }
    )


