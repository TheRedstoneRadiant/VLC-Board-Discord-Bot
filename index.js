const Discord = require('discord.js');
const client = new Discord.Client({ intents: 32727 });

const { createCanvas } = require("canvas");
const fs = require("fs");

const { MongoClient, ServerApiVersion } = require("mongodb");

const mongoClient = new MongoClient(process.env["MONGO_URI"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

mongoClient.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});

const boardCollection = mongoClient.db("board").collection("pixels");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    sendImage();
});

const colors = {
    // 1: "#6d001a",
    // 2: "#be0039",
    3: "#ff4500",
    4: "#ffa800",
    5: "#ffd635",
    // 6: "#fff8b8",
    7: "#00a368",
    // 8: "#00cc78",
    9: "#7eed56",
    // 10: "#00756f",
    // 11: "#009eaa",
    // 12: "#00ccc0",
    13: "#2450a4",
    14: "#3690ea",
    15: "#51e9f4",
    // 16: "#493ac1",
    // 17: "#6a5cff",
    // 18: "#94b3ff",
    19: "#811e9f",
    20: "#b44ac0",
    // 21: "#e4abff",
    // 22: "#de107f",
    // 23: "#ff3881",
    24: "#ff99aa",
    // 25: "#6d482f",
    26: "#9c6926",
    // 27: "#ffb470",
    28: "#000000",
    // 29: "#515252",
    30: "#898d90",
    31: "#d4d7d9",
    32: "#ffffff",
};

const generateCanvasImage = (pixelArray) => {
    // Dimensions for the image
    const width = pixelArray[0].length * 10;
    const height = pixelArray.length * 10;

    // Instantiate the canvas object
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Fill the rectangle with purple
    for (let y = 0; y < pixelArray.length; y += 1) {
        for (let x = 0; x < pixelArray[y].length; x += 1) {
            ctx.fillStyle = colors[pixelArray[y][x]];
            ctx.fillRect(x * 10, y * 10, 10, 10);
        }
    }

    // Write the image to file
    const buffer = canvas.toBuffer("image/png");
    return buffer;
}

let oldPixelArray;

const sendImage = async () => {
    const board = await boardCollection.findOne({ _id: "latestBoard" });
    if (board.pixelArray == oldPixelArray) {
        return;
    }

    oldPixelArray = board.pixelArray;
    const buffer = generateCanvasImage(board.pixelArray);
    const attachment = new Discord.AttachmentBuilder(buffer, { name: "canvas.png" });

    const now = new Date();

    client.channels.cache.get('982222720634859540').send({
        "content": null,
        "embeds": [
            {
                "title": `Snapshot ${now.toISOString()}`,
                "url": "https://vlcboard.ga",
                "color": null,
                "timestamp": now.toISOString(),
                "image": {
                    "url": "attachment://canvas.png"
                }
            }
        ],
        "files": [
            attachment
        ]
    });
}

setInterval(sendImage, 300000); // 300000 milliseconds = 5 minutes

client.login(process.env["DISCORD_TOKEN"]);
