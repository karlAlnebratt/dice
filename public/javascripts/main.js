"use strict";

// Matter.js module aliases
var worldWidth = 800;
var worldHeight = 600;

var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;
var Query = Matter.Query;
var Composite = Matter.Composite;
var Vector = Matter.Vector;

var isRunning = true;
var speedPanning = -3;
var rangeTerrain = {
    from: 50,
    to: 220
};

// create a Matter.js engine
var engine = Engine.create(document.body, {
    render: {
        options: {
            width: worldWidth,
            height: worldHeight,
            background: '/images/stars.jpg',
            wireframes: false
        }
    }
});

// references for terrain
var terrainBodies = [],
    buildingProp = {
        width: 40,
        height: null,
        y: 600
    };

var compositeTerrain = Composite.create();

// apply force to terrain bodies
Events.on(engine, 'tick', function (event) {

    if(isRunning) {
        Composite.translate(compositeTerrain, { x: speedPanning, y: 0 });
    }

    var terrainBodies = Composite.allBodies(compositeTerrain);

    if(terrainBodies) {
        // Check if last is fully in viewport
        var terrainBody = null;
        if(terrainBodies.length > 0) {
            terrainBody = terrainBodies[terrainBodies.length - 1];
        } else {
            terrainBody = terrainBodies;
        }

        if(terrainBody.bounds) {
            if(800 - 50 > terrainBody.bounds.min.x) {
                addTerrain();
            }
        }
    }

    var isHit = Query.region(terrainBodies, ship.bounds);
    var posY = ship.position.y;

    if(!!isHit.length || posY >= 580 || posY <= 20) {
        ship.render.sprite.texture = '/images/explosion.png';
        ship.isStatic = true;
        isRunning = false;
    }

});

// create two boxes and a ground
var ship = Bodies.rectangle(400, 320, 40, 40, {
    id: "ship",
    frictionAir: 0.1,
    mass: 0,
    torque: 0,
    render: {
        sprite: {
            texture: '/images/ship.png'
        }
    }
});


// add all of the bodies to the world
World.add(engine.world, [ship]);

document.addEventListener("keydown", function(event){
    var key = event.which;

    if(key === 38) {
        moveShipUp();
    } else if(key == 32) {
        shootFromShip();
    } else {
        return;
    }

    event.preventDefault();

});

// run the engine
Engine.run(engine);

function addTerrain() {
    addTerrainPieceTop();
    addTerrainPieceBottom();
}
addTerrain();

function addTerrainPieceTop() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(rangeTerrain.from, rangeTerrain.to);

    var terrainBody = Bodies.rectangle(
        825,
        0 + randomHeight / 2,
        50,
        randomHeight,
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: {
                sprite: {
                    texture: '/images/rocks_top.png'
                }
            }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function addTerrainPieceBottom() {

    var containerWidth = compositeTerrain.width;
    var randomHeight = randomIntFromInterval(rangeTerrain.from, rangeTerrain.to);

    var terrainBody = Bodies.rectangle(
        825,
        600 - (randomHeight / 2),
        50,
        randomHeight,
        {
            isStatic: true,
            id: "building",
            friction: 0.1,
            render: {
                sprite: {
                    texture: '/images/rocks_bottom.png'
                }
            }
        }
    );

    Composite.add(compositeTerrain, terrainBody);

    // Add terrain to the world
    World.add(engine.world, [terrainBody]);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function shootFromShip() {
    var boundsShip = ship.bounds;

    var laser = Bodies.rectangle(
        boundsShip.min.x,
        boundsShip.min.y,
        5,
        5,
        {
            density: 0.001,
            friction: 0,
            frictionAir: 0,
            angle: randomIntFromInterval(-360, 360) * (Math.PI / 180),
            render: {
                fillStyle: 'white',
                strokeStyle: 'white'
            },
            collisionFilter: {
                mask: null
            }
        }
    );

    Body.applyForce(laser, {
        x: boundsShip.min.x,
        y: boundsShip.min.y
    }, {
        x: 0.0005,
        y: -0.0005
    });

    World.add(engine.world, [laser]);
}

function moveShipUp(direction) {
    var forcePoint = {
        x: -0.09,
        y: 0
    };

    var rotatedForcePoint = Vector.rotate(forcePoint, ship.angle);

    Body.applyForce(ship, {
        x: 0, y: 0
    }, rotatedForcePoint);
}


function shootMissile() {
    var randomPos = randomIntFromInterval(0, 800);

    var missile = Bodies.rectangle(
        randomPos,
        600,
        25,
        50,
        {
            mass: 10,
            friction: 0,
            torque: 0.15,
            collisionFilter: {
                mask: null
            },
            render: {
                sprite: {
                    texture: '/images/missile.png'
                }
            }
        }
    );

    Body.applyForce(missile, {
        x: randomPos,
        y: 600
    }, {
        x: 0,
        y: -0.9
    });

    World.add(engine.world, [missile]);

}
shootMissile();

setInterval(function() {
    shootMissile();
}, 2000);
