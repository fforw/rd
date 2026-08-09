const path = require("path");
const util = require("util");
const fs = require("fs");

const Jimp = require("jimp");
const pack = require('bin-pack');

const ATLASES = [
    {
        path: "../atlas",
        variant : 1
    }

];

const OUTPUT_DIR = "../assets";


function endsWith(file, suffix)
{

    return !suffix || file.lastIndexOf(suffix) === file.length - suffix.length;
}

const EMPTY_ATLAS = { frames: {} };

function readAtlasJSON(path)
{
    if (fs.existsSync(path))
    {
        return JSON.parse(fs.readFileSync(path, "UTF-8"));
    }
    else
    {
        return EMPTY_ATLAS;
    }
}


function reduceMax(a,b)
{
    return Math.max(a,b);
}


/**
 * Allows the use of absolute pixel pivots in the template which are turned into fractional pivots
 * @param frame
 * @return {object} frame with fractional pivot
 */
function pixelPivot(frame, w, h)
{
    if (!frame)
    {
        return null;
    }

    const { x, y } = frame.pivot;

    if (Math.abs(x) > 1)
    {

        frame.pivot.x  /= w
    }
    if (Math.abs(y) > 1)
    {

        frame.pivot.y  /= h
    }

    return frame;
}


function generateAtlas(atlasPath, index, variant)
{
    const curr = path.join(__dirname, atlasPath);

    console.log("Generate for", curr);

    const predefinedAtlas = readAtlasJSON(path.join(curr, "atlas.json"));

    // Object.keys(predefinedAtlas.frames)
    //     .forEach(
    //         n => console.log(n, ": ", JSON.stringify(predefinedAtlas.frames[n]))
    //     );
    
    const promises = [];

    fs.readdirSync(curr).forEach(file => {

        if (endsWith(file, ".png"))
        {
            promises.push(
                Jimp.read(path.join(curr, file)).then(img => {

                    //console.log("READ IMAGE", file, img.getWidth() + "x" + img.getHeight())

                    return ({
                        id: file,
                        width: img.getWidth(),
                        height: img.getHeight(),
                        img
                    });
                })
            );
        }
    });

    Promise.all(promises).then(
        images =>  {
            const promises = [];
            images.forEach(img => {
                promises.push(Promise.resolve(img));
            })
            return Promise.all(promises);
        })
        .then(
        images => {


            const result = pack(images, {
                inPlace: true
            });

            const {width, height} = result;

            //console.log("IMAGES", images);

            // const width = images.map(img => +img.x + img.width).reduce(reduceMax, 0);
            // const height = images.map(img => +img.y + img.height).reduce(reduceMax, 0);

            console.log("\nActual atlas dimensions: ", width, height);

            Jimp.create(width, height, 0x00000000).then(atlasImg => {

                const atlas = {frames: {}};

                images.forEach(function (bin) {

                    const {x, y, width: w, height: h, img} = bin;

                    atlas.frames[bin.id] = {

                        // default values ...
                        rotated: false,
                        trimmed: false,
                        spriteSourceSize: {
                            x: 0,
                            y: 0,
                            w,
                            h
                        },
                        sourceSize: {
                            w,
                            h
                        },
                        pivot: {
                            x: 0.5,
                            y: 0.5
                        },
                        // ... potentially overridden by values from the atlas template
                        ...pixelPivot(predefinedAtlas.frames[bin.id], w, h),

                        // ... but not "frame"
                        frame: {
                            x,
                            y,
                            w,
                            h
                        },

                    };

                    atlasImg.blit(img, x, y)
                });
                const imageName = "atlas-" + index + ".png";

                atlas.meta = {
                    app: "http://ww.github.com/fforw/rd",
                    version: "0.1",
                    image: imageName,
                    format: "RGBA8888",
                    size: {
                        w: width,
                        h: height
                    },
                    scale: "1"
                };

                fs.writeFileSync(
                    path.join(__dirname, OUTPUT_DIR, "atlas-" + index + ".json"),
                    JSON.stringify(atlas, null, 4),
                    "UTF-8"
                );

                atlasImg.writeAsync(path.join(__dirname, OUTPUT_DIR, imageName));

            });

        })
    .catch(e => console.error("Error reading images", e))
}

function readMarchingSquares()
{
    return Promise.all(
        [
            "case-1.png",
            "case-2.png",
            "case-3.png",
            "case-4.png",
            "case-5-1.png",
            "case-6.png",
            "case-7.png",
            "case-8.png",
            "case-9.png",
            "case-10-1.png",
            "case-11.png",
            "case-12.png",
            "case-13.png",
            "case-14.png",
            "case-15.png",
            "case-m1.png",
            "case-m2.png",
            "case-m3.png",
            "case-m4.png",
            "case-5-2.png", // 18
            "case-10-2.png", // 19
        ].map(
            name => Jimp.read(
                path.join(
                    __dirname,
                    "ms-masks/" + name
                )
            )
        )
    );
}

for (let i = 0; i < ATLASES.length; i++)
{
    const { path, variant } = ATLASES[i];
    generateAtlas(path, i, variant);
}






