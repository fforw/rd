import "./style.css"
import { Application, Assets, Texture } from "pixi.js"
import { Tilemap } from "@pixi/tilemap"
import { buttonPressed } from "./util"
import Title from "./screen/Title"
import { BUTTON_STYLES } from "./button-styles"
import Game from "./screen/Game"

// Create a PixiJS application.
const app = new Application();

let gamepad

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

/**
 * @callback InitCallback
 * @param {ScreenContext} ctx   screen context
 * @param {*} [arg]             Optional argument
 */

/**
 * Screen Definition
 *
 * @typedef {Object} ScreenDefinition
 * @property {string} name
 * @property {InitCallback} init
 */

/**
 * @callback RunScreenCallback
 * @param {ScreenDefinition} screen     new screen
 * @param {*} [arg]                     Optional argument to init()
 */

/**
 * Screen context object
 *
 * @typedef {Object} ScreenContext
 * @property {Application} app                  Pixi app
 * @property {string[]} buttons                 Button names
 * @property {function} gamepad                 Returns the current gamepad
 * @property {function|null} destroyFn          destroy function returned from init
 * @property {ScreenDefinition} screen          current screen
 * @property {RunScreenCallback} runScreen      runs another screen
 */

/**
 *
 * @param {ScreenDefinition} screen   new screen
 * @param {*} arg                       optional argument passed to the screen's init()
 */
function runScreen(screen, arg = undefined)
{
    return Promise.resolve(invoke(screenContext.destroyFn, screenContext))
        .then( () => {
            screenContext.screen = screen
            return invoke(screenContext.screen.init, screenContext, arg)
        })
        .then( destroyFn => {
            if (destroyFn)
            {
                screenContext.destroyFn = destroyFn
            }
        })

}


function trigger(predicate, effect)
{
    triggers.push([
        predicate,
        effect,
        false
    ])
}


/**
 *  Screen context object
 * @type {ScreenContext}
 */
const screenContext = {
    screen: null,
    app: null,
    buttons: null,
    gamepad: () => gamepad,
    runScreen,

    onPrimaryButton: function(cb) {
        trigger(
            () => gamepad && buttonPressed(gamepad.buttons[0]),
            cb
        )
    },

    onSecondaryButton: function(cb) {
        trigger(
            () => gamepad && buttonPressed(gamepad.buttons[1]),
            cb
        )
    },
    trigger
}

let triggers = []

function runTriggers()
{
    const newTriggers = [];

    for (let i = 0; i < triggers.length; i++)
    {
        const trigger = triggers[i]
        const [ predicate, effect, ready ] = trigger

        if (ready)
        {
            if (predicate())
            {
                effect();
            }
            else
            {
                newTriggers.push(trigger);
            }
        }
        else
        {
            if (!predicate())
            {
                trigger[2] = true
            }
            newTriggers.push(trigger);
        }

        triggers = newTriggers;
    }

}

function invoke(fn, ctx, arg)
{
    if (typeof fn === "function")
    {
        return Promise.resolve(fn(ctx, arg))
    }
    return Promise.resolve()
}




// Initialize the application.
app.init({ background: '#16161d', resizeTo: window })
    .then(
        () => {
            //console.log("BUTTONS", screenContext.buttons)

            // Then adding the application's canvas to the DOM body.
            document.body.appendChild(app.canvas);
            
            Assets.add({ alias: 'atlas', src: 'assets/atlas-0.json'});

            // const tilemap2 = new CompositeTilemap();
            // app.stage.addChild(tilemap2);
            Assets.load([
                'atlas',
            ]).then(() =>
            {
                let tilemap = new Tilemap([Texture.from("title.png").source]);
                app.stage.addChild(tilemap);

                // TODO: figure how to set button style either via name or config options
                screenContext.buttons = BUTTON_STYLES[1].buttons
                screenContext.app = app

                runScreen(Title)
                    .then(result => {
                    })

                app.ticker.add(time => {
                    // x += time.deltaTime
                    // build(x,y)

                    runTriggers()
                    //logGamepadState()
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

// const size = 20
// const ox = 0
// const oy = 0
// let x = ox + 96 + 16, y = oy + 96
// function build(x,y)
// {
//     // app.stage.removeChild(tilemap);
//     // tilemap = new Tilemap([Texture.from("smiley.png").source]);
//     // app.stage.addChild(tilemap);
//     tilemap.clear()
//     app.stage.renderGroup.onChildUpdate(tilemap);
//     for (let y = 0; y < size; y++)
//     {
//         for (let x = 0; x < size; x++)
//         {
//             const isBorder = (x === 0) || (x === size - 1) || (y === 0) || (y === size - 1)
//             tilemap.tile(isBorder || Math.random() < 0.5 ? "wall.png" : "floor.png", ox + x * 32, oy + y * 32)
//         }
//     }
//
//     //tilemap.tile(buttons[(x>>4)&3], x | 0, y)
// }
// build(0,0)
